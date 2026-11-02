import { describe, it, expect } from "vitest";
import { QRCodeRenderer } from "../../src/core/qr/renderer";
import { generateBarcodeSVG } from "../../src/core/barcode/generator";
import { isValidColor, sanitizeColor } from "../../src/core/security/color";
import dompurify from "dompurify";
// @ts-ignore
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
// @ts-ignore
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
  measureText: (text: string) => ({ width: text.length * 8 }),
  font: ""
});
global.document = dom.window.document;
global.XMLSerializer = dom.window.XMLSerializer;
const DOMPurify = (dompurify as any)(dom.window);

describe("OmniCode Offensive Security & XSS Hardening Suite", () => {
  describe("Color Validator & Sanitizer", () => {
    it("validates legitimate colors correctly", () => {
      expect(isValidColor("#fff")).toBe(true);
      expect(isValidColor("#10b981")).toBe(true);
      expect(isValidColor("#10b98188")).toBe(true);
      expect(isValidColor("rgb(255, 0, 0)")).toBe(true);
      expect(isValidColor("rgba(0, 128, 255, 0.5)")).toBe(true);
      expect(isValidColor("transparent")).toBe(true);
      expect(isValidColor("white")).toBe(true);
      expect(isValidColor("black")).toBe(true);
    });

    it("rejects malicious XSS injection payloads in colors", () => {
      const payloads = [
        '#000" /><script>alert(1)</script><rect fill="',
        'red" onmouseover="alert(1)" x="',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        '<svg onload=alert(1)>',
        'expression(alert(1))'
      ];

      for (const payload of payloads) {
        expect(isValidColor(payload)).toBe(false);
        expect(sanitizeColor(payload, "#000000")).toBe("#000000");
      }
    });
  });

  describe("QR Code SVG Renderer Sanitization", () => {
    it("neutralizes XSS attempts injected through color options", () => {
      const maliciousColor = '#000" /><script>alert("xss")</script><g fill="';
      const renderer = new QRCodeRenderer({
        width: 300,
        height: 300,
        margin: 10,
        data: "https://omnicode.studio",
        errorCorrectionLevel: "M",
        dotsOptions: {
          type: "square",
          colorOrGradient: { color: maliciousColor }
        },
        cornersSquareOptions: {
          type: "square",
          colorOrGradient: { color: maliciousColor }
        },
        cornersDotOptions: {
          type: "dot",
          colorOrGradient: { color: maliciousColor }
        },
        backgroundOptions: {
          color: maliciousColor,
          transparent: false
        }
      });

      const { svgString } = renderer.render();
      expect(svgString).not.toContain("<script>");
      expect(svgString).not.toContain('alert("xss")');
      // Should fallback to default sanitized color
      expect(svgString).toContain('fill="#000000"');
    });

    it("blocks javascript: and invalid schemes in logo URL", () => {
      const renderer = new QRCodeRenderer({
        width: 300,
        height: 300,
        margin: 10,
        data: "https://omnicode.studio",
        errorCorrectionLevel: "H",
        dotsOptions: { type: "square", colorOrGradient: { color: "#000000" } },
        cornersSquareOptions: { type: "square", colorOrGradient: { color: "#000000" } },
        cornersDotOptions: { type: "dot", colorOrGradient: { color: "#000000" } },
        backgroundOptions: { color: "#ffffff", transparent: false },
        logoOptions: {
          url: 'javascript:alert(document.cookie)',
          protectZone: true
        }
      });

      expect(() => renderer.render()).toThrow(/Security Violation/);
    });
  });

  describe("Barcode SVG Generator Sanitization", () => {
    it("neutralizes XSS payloads in barcode frame labels and colors", () => {
      const maliciousPayload = '<script>alert("xss")</script>';
      const maliciousColor = 'blue" onfocus="alert(1)"';

      const svg = generateBarcodeSVG({
        format: "CODE128",
        data: "SECURITY-CHECK",
        style: "thermal-label",
        lineColor: maliciousColor,
        background: maliciousColor,
        headerText: maliciousPayload,
        footerText: maliciousPayload
      });

      expect(svg).not.toContain("<script>");
      expect(svg).toContain("&lt;script&gt;");
      expect(svg).not.toContain('onfocus="alert(1)"');
    });
  });

  describe("DOMPurify SVG Output Verification", () => {
    it("strips active script elements and event handlers from any injected SVG", () => {
      const dirtySvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#ffffff" onload="alert('pwned')" />
          <script>window.pwned = true;</script>
        </svg>
      `;

      const cleanSvg = DOMPurify.sanitize(dirtySvg, {
        USE_PROFILES: { svg: true, svgFilters: true }
      });

      expect(cleanSvg).not.toContain("<script>");
      expect(cleanSvg).not.toContain("onload=");
      expect(cleanSvg).toContain("<rect");
    });
  });
});
