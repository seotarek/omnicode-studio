import { describe, it, expect } from "vitest";
import { OmniCode, type OmniCodePlugin } from "../src/index.js";

describe("OmniCode Core Engine Suite", () => {
  it("provides comprehensive supported formats matrix", () => {
    const formats = OmniCode.getSupportedFormats();
    expect(formats.barcodes).toContain("CODE128");
    expect(formats.barcodes).toContain("EAN13");
    expect(formats.barcodes).toContain("MSI");
    expect(formats.barcodes).toContain("codabar");
    expect(formats.qrErrorLevels).toEqual(["L", "M", "Q", "H"]);
    expect(formats.presets.length).toBeGreaterThan(0);
  });

  it("generates valid QR code SVG via unified OmniCode.generateQr", () => {
    const res = OmniCode.generateQr({
      data: "https://omnicode.studio",
      width: 250,
      height: 250,
      errorCorrectionLevel: "H"
    });
    expect(res.svgString).toContain("<svg");
    expect(res.svgString).toContain("</svg>");
    expect(res.moduleCount).toBeGreaterThan(20);
  });

  it("generates valid Barcode SVG via unified OmniCode.generateBarcode", () => {
    const svg = OmniCode.generateBarcode({
      format: "CODE128",
      data: "OMNICODE-PROD",
      width: 2,
      height: 70
    });
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("validates barcode data and calculates check digits", () => {
    const validEan = OmniCode.validateBarcode("EAN13", "4006381333931");
    expect(validEan.isValid).toBe(true);

    const invalidEan = OmniCode.validateBarcode("EAN13", "4006381333939");
    expect(invalidEan.isValid).toBe(false);

    const checkDigit = OmniCode.calculateCheckDigit("400638133393");
    expect(checkDigit).toBe(1);
  });

  it("supports plugin extension lifecycle hooks", () => {
    let hookExecuted = false;
    const testPlugin: OmniCodePlugin = {
      name: "test-metadata-plugin",
      version: "1.0.0",
      onBeforeGenerate: (type, options) => {
        hookExecuted = true;
        return options;
      }
    };

    OmniCode.registerPlugin(testPlugin);
    expect(OmniCode.getPlugins().some((p) => p.name === "test-metadata-plugin")).toBe(true);

    OmniCode.generateBarcode({
      format: "CODE128",
      data: "PLUGIN-HOOK-TEST"
    });

    expect(hookExecuted).toBe(true);
  });

  it("executes batch processing for mixed QR and barcode items", () => {
    const batchResults = OmniCode.batch([
      {
        id: "item-1",
        type: "qr",
        options: { data: "https://item1.test", width: 200, height: 200 }
      },
      {
        id: "item-2",
        type: "barcode",
        options: { format: "EAN13", data: "4006381333931" }
      },
      {
        id: "item-3",
        type: "barcode",
        options: { format: "EAN13", data: "INVALID_CHECK_DIGIT_DATA" }
      }
    ]);

    expect(batchResults.length).toBe(3);
    expect(batchResults[0].success).toBe(true);
    expect(batchResults[0].svg).toContain("<svg");

    expect(batchResults[1].success).toBe(true);
    expect(batchResults[1].svg).toContain("<svg");

    expect(batchResults[2].success).toBe(false);
    expect(batchResults[2].error).toBeDefined();
  });

  it("encodes SVG to base64 and data URLs", () => {
    const svg = '<svg width="10" height="10"></svg>';
    const b64 = OmniCode.toBase64(svg);
    expect(b64.length).toBeGreaterThan(0);

    const dataUrl = OmniCode.toDataUrl(svg);
    expect(dataUrl.startsWith("data:image/svg+xml;base64,")).toBe(true);
  });
});
