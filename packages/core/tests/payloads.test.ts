import { describe, it, expect } from "vitest";
import {
  encodeGs1DigitalLink,
  encodeEpcSepa,
  encodeZatcaInvoice,
  decodeZatcaInvoice
} from "../src/index.js";

describe("Enterprise 2D Barcode Payloads Suite", () => {
  describe("GS1 Digital Link URI Standard (Sunrise 2027)", () => {
    it("correctly encodes and zero-pads GTIN-12 to GTIN-14", () => {
      const uri = encodeGs1DigitalLink({
        gtin: "614141000036", // 12 digits
        lot: "BATCH-882",
        serial: "SN-99014",
        expiryDate: "281231"
      });

      expect(uri).toContain("https://id.gs1.org/01/00614141000036");
      expect(uri).toContain("/10/BATCH-882");
      expect(uri).toContain("/21/SN-99014");
      expect(uri).toContain("17=281231");
    });

    it("supports custom brand resolver domain and consumer product variants", () => {
      const uri = encodeGs1DigitalLink({
        domain: "https://id.brand.com/",
        gtin: "04006381333931",
        cpv: "COLOR-RED",
        attributes: { "custom_ref": "REF-7" }
      });

      expect(uri.startsWith("https://id.brand.com/01/04006381333931/22/COLOR-RED")).toBe(true);
      expect(uri).toContain("custom_ref=REF-7");
    });
  });

  describe("EPC SEPA Payment QR Code (EPC069-12)", () => {
    it("encodes valid SEPA credit transfer payload", () => {
      const epc = encodeEpcSepa({
        beneficiaryName: "Red Cross Belgium",
        iban: "BE72 0000 0000 1616",
        bic: "BPOTBEB1",
        amount: 25.50,
        purpose: "CHAR",
        remittanceInformation: "Emergency Donation 2026"
      });

      const lines = epc.split("\n");
      expect(lines[0]).toBe("BCD");
      expect(lines[1]).toBe("002");
      expect(lines[2]).toBe("1");
      expect(lines[3]).toBe("SCT");
      expect(lines[4]).toBe("BPOTBEB1");
      expect(lines[5]).toBe("Red Cross Belgium");
      expect(lines[6]).toBe("BE72000000001616");
      expect(lines[7]).toBe("EUR25.50");
      expect(lines[8]).toBe("CHAR");
      expect(lines[10]).toBe("Emergency Donation 2026");
    });
  });

  describe("Saudi ZATCA E-Invoicing (Fatoora) TLV Base64", () => {
    it("encodes and round-trip decodes Phase 1 & 2 invoice data with Arabic support", () => {
      const invoice = {
        sellerName: "شركة أومني كود للتقنية المحدودة",
        vatRegistrationNumber: "300000000000003",
        timestamp: "2026-11-03T10:00:00Z",
        totalWithVat: "1150.00",
        vatTotal: "150.00",
        xmlHash: "base64EncodedXmlHashSample123456="
      };

      const base64Tlv = encodeZatcaInvoice(invoice);
      expect(base64Tlv.length).toBeGreaterThan(50);

      const decoded = decodeZatcaInvoice(base64Tlv);
      expect(decoded[1]).toBe(invoice.sellerName);
      expect(decoded[2]).toBe("300000000000003");
      expect(decoded[3]).toBe("2026-11-03T10:00:00Z");
      expect(decoded[4]).toBe("1150.00");
      expect(decoded[5]).toBe("150.00");
      expect(decoded[6]).toBe("base64EncodedXmlHashSample123456=");
    });
  });
});
