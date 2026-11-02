import { describe, it, expect } from "vitest";
import { OmniCode } from "../src/engine.js";
import { svgToEps } from "../src/export/eps.js";

describe("OmniCode EPS Vector Exporter Suite", () => {
  it("converts Barcode SVG to compliant EPS PostScript Level 2/3", () => {
    const svg = OmniCode.generateBarcode({
      format: "CODE128",
      data: "EPS-TEST-12345",
      width: 2,
      height: 80,
      displayValue: true
    });

    const eps = OmniCode.toEps(svg, {
      title: "OmniCode Barcode Test",
      creator: "OmniCode Test Suite"
    });

    expect(eps).toContain("%!PS-Adobe-3.0 EPSF-3.0");
    expect(eps).toContain("%%BoundingBox:");
    expect(eps).toContain("%%Title: OmniCode Barcode Test");
    expect(eps).toContain("%%Creator: OmniCode Test Suite");
    expect(eps).toContain("/rf {"); // rectfill macro
    expect(eps).toContain("showpage");
    expect(eps).toContain("%%EOF");
    // Should have rectfill commands for the bars
    expect(eps).toMatch(/\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)? rf/);
  });

  it("converts QR Code SVG to compliant EPS with quiet zone", () => {
    const qrResult = OmniCode.generateQr({
      data: "https://omnicode.studio",
      width: 400,
      height: 400,
      errorCorrectionLevel: "H"
    });

    const eps = svgToEps(qrResult.svgString, {
      title: "OmniCode QR Test"
    });

    expect(eps).toContain("%!PS-Adobe-3.0 EPSF-3.0");
    expect(eps).toContain("%%BoundingBox: 0 0 400 400");
    expect(eps).toContain("showpage");
    expect(eps).toContain("%%EOF");
    // Should contain module drawing commands
    expect(eps).toContain("rf");
  });

  it("handles thermal label barcodes with text and lines in EPS", () => {
    const svg = OmniCode.generateBarcode({
      format: "CODE128",
      data: "THERMAL-7788",
      style: "thermal-label",
      headerText: "WAREHOUSE ZONE 4",
      footerText: "PRIORITY CARRIER"
    });

    const eps = OmniCode.toEps(svg);

    expect(eps).toContain("%!PS-Adobe-3.0 EPSF-3.0");
    expect(eps).toContain("showpage");
    expect(eps).toContain("%%EOF");
    // Should include text commands
    expect(eps).toContain("tx");
  });

  it("supports Bar Width Reduction (BWR) for flexographic print compensation", () => {
    const svg = OmniCode.generateBarcode({
      format: "CODE128",
      data: "BWR-SAMPLE"
    });

    const epsStandard = svgToEps(svg, { barWidthReduction: 0 });
    const epsReduced = svgToEps(svg, { barWidthReduction: 0.5 });

    expect(epsStandard).not.toEqual(epsReduced);
    expect(epsReduced).toContain("%!PS-Adobe-3.0 EPSF-3.0");
  });
});
