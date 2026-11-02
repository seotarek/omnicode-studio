import { describe, it, expect } from "vitest";
import { encodeWifi, encodeVCard, encodeWhatsApp } from "../../src/core/payloads/encoders";
import { calculateContrast, validateScannability } from "../../src/core/validator/scannability";
import { validateBarcodeData } from "../../src/core/barcode/generator";
import { QRCodeRenderer } from "../../src/core/qr/renderer";

describe("Payload Encoders", () => {
  it("encodes WiFi WPA credentials correctly", () => {
    const res = encodeWifi({ ssid: "HomeNetwork", password: "Secret;Password", encryption: "WPA" });
    expect(res).toBe("WIFI:T:WPA;S:HomeNetwork;P:Secret\\;Password;H:false;;");
  });

  it("encodes vCard 3.0 correctly", () => {
    const res = encodeVCard({ firstName: "Tarek", lastName: "Mohamed", phone: "+201000000000" });
    expect(res).toContain("BEGIN:VCARD");
    expect(res).toContain("FN:Tarek Mohamed");
    expect(res).toContain("TEL;TYPE=CELL:+201000000000");
    expect(res).toContain("END:VCARD");
  });

  it("encodes WhatsApp direct chat link", () => {
    const res = encodeWhatsApp("+20 100 123 4567", "Hello from OmniCode");
    expect(res).toBe("https://wa.me/201001234567?text=Hello%20from%20OmniCode");
  });
});

describe("Contrast and Scannability", () => {
  it("calculates high contrast for black on white", () => {
    const ratio = calculateContrast("#000000", "#ffffff");
    expect(ratio).toBeGreaterThan(15);
  });

  it("warns when low contrast occurs", () => {
    const res = validateScannability({
      fgColor: "#777777",
      bgColor: "#888888",
      errorCorrectionLevel: "M",
      hasLogo: false
    });
    expect(res.isScannable).toBe(false);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});

describe("Barcode Validation", () => {
  it("validates EAN-13 digit lengths", () => {
    expect(validateBarcodeData("EAN13", "1234567890128").isValid).toBe(true);
    expect(validateBarcodeData("EAN13", "12345").isValid).toBe(false);
  });

  it("validates CODE39 supported characters", () => {
    expect(validateBarcodeData("CODE39", "CODE-39").isValid).toBe(true);
    expect(validateBarcodeData("CODE39", "lowercase").isValid).toBe(false);
  });
});

describe("QRCodeRenderer", () => {
  it("renders a valid SVG string", () => {
    const renderer = new QRCodeRenderer({
      width: 300,
      height: 300,
      margin: 10,
      data: "https://omnicode.studio",
      errorCorrectionLevel: "M",
      dotsOptions: { type: "rounded", colorOrGradient: { color: "#10b981" } },
      cornersSquareOptions: { type: "extra-rounded", colorOrGradient: { color: "#047857" } },
      cornersDotOptions: { type: "dot", colorOrGradient: { color: "#047857" } },
      backgroundOptions: { color: "#ffffff" }
    });
    const result = renderer.render();
    expect(result.svgString).toContain("<svg");
    expect(result.svgString).toContain("viewBox=\"0 0 300 300\"");
    expect(result.moduleCount).toBeGreaterThan(20);
  });
});
