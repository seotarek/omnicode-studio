import { describe, it, expect } from "vitest";
import {
  encodeGs1DigitalLink,
  encodeEpcSepa,
  encodeWifi,
  encodeVCard,
  encodeZatcaInvoice,
  decodeZatcaInvoice
} from "../src/payloads/encoders.js";
import {
  decodeGs1DigitalLink,
  decodeEpcSepa,
  decodeWifi,
  decodeVCard
} from "../src/payloads/decoders.js";

describe("OmniCode Payload Decoders Suite", () => {
  it("encodes and decodes GS1 Digital Link 2027 URI accurately", () => {
    const original = {
      domain: "https://id.gs1.org",
      gtin: "06291041500213",
      lot: "BATCH-2026-X",
      serial: "SN-99881",
      expiryDate: "261231"
    };

    const encoded = encodeGs1DigitalLink(original);
    const decoded = decodeGs1DigitalLink(encoded);

    expect(decoded.domain).toBe(original.domain);
    expect(decoded.gtin).toBe(original.gtin);
    expect(decoded.lot).toBe(original.lot);
    expect(decoded.serial).toBe(original.serial);
    expect(decoded.expiryDate).toBe(original.expiryDate);
  });

  it("encodes and decodes EPC SEPA Bank Transfer QR payload accurately", () => {
    const original = {
      beneficiaryName: "OmniCode Studio Enterprise",
      iban: "DE89370400440532013000",
      bic: "DBEUMM21XXX",
      amount: 149.95,
      remittanceInformation: "INV-2026-99"
    };

    const encoded = encodeEpcSepa(original);
    const decoded = decodeEpcSepa(encoded);

    expect(decoded.beneficiaryName).toBe(original.beneficiaryName);
    expect(decoded.iban).toBe(original.iban);
    expect(decoded.bic).toBe(original.bic);
    expect(decoded.amount).toBe(original.amount);
    expect(decoded.currency).toBe("EUR");
    expect(decoded.remittanceInformation).toBe(original.remittanceInformation);
  });

  it("encodes and decodes WiFi credentials with special characters accurately", () => {
    const original = {
      ssid: "Secure;Corp\\Guest:Office",
      password: "P@ssw;ord:2026!\\",
      encryption: "WPA" as const,
      hidden: true
    };

    const encoded = encodeWifi(original);
    const decoded = decodeWifi(encoded);

    expect(decoded.ssid).toBe(original.ssid);
    expect(decoded.password).toBe(original.password);
    expect(decoded.encryption).toBe("WPA");
    expect(decoded.hidden).toBe(true);
  });

  it("encodes and decodes vCard 3.0 contact cards accurately", () => {
    const original = {
      firstName: "Tarek",
      lastName: "Mohamed",
      organization: "OmniCode Studio",
      title: "Solutions Architect",
      phone: "+966500000000",
      email: "tarek@omnicode.studio",
      url: "https://omnicode.studio",
      address: "Riyadh, Saudi Arabia"
    };

    const encoded = encodeVCard(original);
    const decoded = decodeVCard(encoded);

    expect(decoded.firstName).toBe(original.firstName);
    expect(decoded.lastName).toBe(original.lastName);
    expect(decoded.organization).toBe(original.organization);
    expect(decoded.title).toBe(original.title);
    expect(decoded.phone).toBe(original.phone);
    expect(decoded.email).toBe(original.email);
    expect(decoded.url).toBe(original.url);
    expect(decoded.address).toContain("Riyadh");
  });

  it("encodes and decodes ZATCA E-Invoicing Phase 1 & 2 TLV tags", () => {
    const original = {
      sellerName: "شركة أومني كود للتقنية المحدودة",
      vatRegistrationNumber: "300000000000003",
      timestamp: "2026-11-03T12:00:00Z",
      totalWithVat: "115.00",
      vatTotal: "15.00"
    };

    const encoded = encodeZatcaInvoice(original);
    const decoded = decodeZatcaInvoice(encoded);

    expect(decoded.sellerName).toBe(original.sellerName);
    expect(decoded.vatRegistrationNumber).toBe(original.vatRegistrationNumber);
    expect(decoded.timestamp).toBe(original.timestamp);
    expect(decoded.totalWithVat).toBe(original.totalWithVat);
    expect(decoded.vatTotal).toBe(original.vatTotal);
  });
});
