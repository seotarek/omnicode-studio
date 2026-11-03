import { describe, it, expect } from "vitest";
import { generateSealSVG, encodeToBinaryPattern } from "../../src/core/seal/generator";
import { SealOptions } from "../../src/core/seal/types";

describe("Seal Generator", () => {
  it("encodeToBinaryPattern produces deterministic non-empty binary string", () => {
    const pattern1 = encodeToBinaryPattern("OMNICODE-2026");
    const pattern2 = encodeToBinaryPattern("OMNICODE-2026");
    expect(pattern1).toBe(pattern2);
    expect(pattern1.length).toBeGreaterThanOrEqual(32);
    expect(/^[01]+$/.test(pattern1)).toBe(true);
  });

  it("generateSealSVG renders valid SVG for radial-barcode", () => {
    const options: SealOptions = {
      type: "radial-barcode",
      data: "RADIAL-12345",
      titleText: "OFFICIAL VERIFICATION SEAL",
      subtitleText: "AUTHENTICATED & SECURE",
      serialNumber: "SN-987654",
      inkColor: "#1e3a8a",
      borderStyle: "scalloped"
    };

    const svg = generateSealSVG(options);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain('viewBox="0 0 500 500"');
    expect(svg).toContain("#1e3a8a");
    expect(svg).toContain("OFFICIAL VERIFICATION SEAL");
    expect(svg).toContain("AUTHENTICATED &amp; SECURE");
    expect(svg).toContain("textPath");
  });

  it("generateSealSVG renders valid SVG for bullseye-barcode", () => {
    const options: SealOptions = {
      type: "bullseye-barcode",
      data: "BULLSEYE-999",
      titleText: "DEPARTMENT OF RECORDS",
      subtitleText: "CERTIFIED COPY",
      inkColor: "#991b1b",
      borderStyle: "double-ring"
    };

    const svg = generateSealSVG(options);
    expect(svg).toContain("<svg");
    expect(svg).toContain("circle");
    expect(svg).toContain("#991b1b");
    expect(svg).toContain("DEPARTMENT OF RECORDS");
  });

  it("generateSealSVG sanitizes text inputs to prevent XSS", () => {
    const options: SealOptions = {
      type: "official-seal",
      data: "XSS-TEST",
      titleText: "<script>alert('xss')</script>",
      subtitleText: 'Test "Quotes" & <Tags>',
      inkColor: "#065f46",
      borderStyle: "scalloped"
    };

    const svg = generateSealSVG(options);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).toContain("&amp;");
    expect(svg).toContain("&quot;Quotes&quot;");
  });
});
