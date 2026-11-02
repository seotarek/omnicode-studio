import { WifiPayload, VCardPayload, CalendarPayload } from "./types.js";

export function encodeWifi(payload: WifiPayload): string {
  const enc = payload.encryption || "WPA";
  const hidden = payload.hidden ? "true" : "false";
  const pass = payload.password ? payload.password.replace(/([;,:\\"])/g, "\\$1") : "";
  const ssid = payload.ssid.replace(/([;,:\\"])/g, "\\$1");
  return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
}

export function encodeVCard(card: VCardPayload): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${card.lastName || ""};${card.firstName || ""};;;`,
    `FN:${[card.firstName, card.lastName].filter(Boolean).join(" ")}`
  ];
  if (card.organization) lines.push(`ORG:${card.organization}`);
  if (card.title) lines.push(`TITLE:${card.title}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL:${card.phone}`);
  if (card.email) lines.push(`EMAIL:${card.email}`);
  if (card.url) lines.push(`URL:${card.url}`);
  if (card.address) lines.push(`ADR:;;${card.address};;;;`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export function encodeWhatsApp(phone: string, text?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const url = `https://wa.me/${cleanPhone}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}

export function encodeEmail(to: string, subject?: string, body?: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length > 0 ? `?${params.join("&")}` : "";
  return `mailto:${to}${query}`;
}

export function encodeSms(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  return message ? `smsto:${cleanPhone}:${message}` : `smsto:${cleanPhone}`;
}

export function encodePhone(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  return `tel:${cleanPhone}`;
}

export function encodeGeo(lat: number, lng: number): string {
  return `geo:${lat},${lng}`;
}

export function encodeCalendar(cal: CalendarPayload): string {
  const formatDate = (iso: string) => iso.replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VEVENT",
    `SUMMARY:${cal.title}`,
    `DTSTART:${formatDate(cal.startDate)}`
  ];
  if (cal.endDate) lines.push(`DTEND:${formatDate(cal.endDate)}`);
  if (cal.description) lines.push(`DESCRIPTION:${cal.description}`);
  if (cal.location) lines.push(`LOCATION:${cal.location}`);
  lines.push("END:VEVENT");
  return lines.join("\n");
}

export function encodeCrypto(payload: { currency: "BTC" | "ETH" | "USDT" | string; address: string; amount?: number; message?: string }): string {
  const scheme = payload.currency.toLowerCase();
  const query: string[] = [];
  if (payload.amount !== undefined) query.push(`amount=${payload.amount}`);
  if (payload.message) query.push(`message=${encodeURIComponent(payload.message)}`);
  const qs = query.length > 0 ? `?${query.join("&")}` : "";
  return `${scheme}:${payload.address}${qs}`;
}

import type { GS1DigitalLinkPayload, EpcSepaPayload, ZatcaInvoicePayload } from "./types.js";

/**
 * Encodes GS1 Digital Link standard URI (Sunrise 2027 compliant).
 */
export function encodeGs1DigitalLink(payload: GS1DigitalLinkPayload): string {
  const domain = (payload.domain || "https://id.gs1.org").replace(/\/+$/, "");
  const cleanGtin = payload.gtin.replace(/\D/g, "");
  if (!cleanGtin || cleanGtin.length > 14) {
    throw new Error("Invalid GTIN: must be numeric with up to 14 digits");
  }
  const gtin14 = cleanGtin.padStart(14, "0");

  let uriPath = `${domain}/01/${gtin14}`;

  if (payload.lot) {
    uriPath += `/10/${encodeURIComponent(payload.lot)}`;
  }
  if (payload.serial) {
    uriPath += `/21/${encodeURIComponent(payload.serial)}`;
  }
  if (payload.cpv) {
    uriPath += `/22/${encodeURIComponent(payload.cpv)}`;
  }

  const queryParams = new URLSearchParams();
  if (payload.expiryDate) {
    queryParams.set("17", payload.expiryDate.replace(/\D/g, ""));
  }
  if (payload.attributes) {
    for (const [key, val] of Object.entries(payload.attributes)) {
      queryParams.set(key, val);
    }
  }

  const qs = queryParams.toString();
  return qs ? `${uriPath}?${qs}` : uriPath;
}

/**
 * Encodes European Payments Council SEPA QR Code (EPC069-12 standard).
 */
export function encodeEpcSepa(payload: EpcSepaPayload): string {
  const beneficiaryName = payload.beneficiaryName || (payload as any).name;
  if (!beneficiaryName) {
    throw new Error("Beneficiary name is required for EPC SEPA payment");
  }
  if (!payload.iban) {
    throw new Error("IBAN is required for EPC SEPA payment");
  }

  const version = payload.version || "002";
  const cleanIban = payload.iban.replace(/\s+/g, "").toUpperCase();
  const amountStr = payload.amount !== undefined && payload.amount > 0
    ? `EUR${Number(payload.amount).toFixed(2)}`
    : "";
  const remittanceInfo = payload.remittanceInformation || (payload as any).remittanceText || "";

  const lines = [
    "BCD",
    version,
    "1", // 1 = UTF-8
    "SCT",
    payload.bic ? payload.bic.trim().toUpperCase() : "",
    beneficiaryName.slice(0, 70),
    cleanIban,
    amountStr,
    payload.purpose ? payload.purpose.slice(0, 4).toUpperCase() : "",
    payload.remittanceReference ? payload.remittanceReference.slice(0, 35) : "",
    remittanceInfo.slice(0, 140),
    payload.beneficiaryOriginatorInfo ? payload.beneficiaryOriginatorInfo.slice(0, 70) : ""
  ];

  return lines.join("\n");
}

/**
 * Helper to build single TLV chunk (Tag-Length-Value)
 */
function toTlvChunk(tag: number, val: string): Uint8Array {
  const encoder = new TextEncoder();
  const valBytes = encoder.encode(val);
  if (valBytes.length > 255) {
    throw new Error(`TLV Tag ${tag} payload exceeds 255 byte limit`);
  }
  const chunk = new Uint8Array(2 + valBytes.length);
  chunk[0] = tag;
  chunk[1] = valBytes.length;
  chunk.set(valBytes, 2);
  return chunk;
}

/**
 * Encodes Saudi Arabia ZATCA E-Invoicing (Fatoora) Phase 1 & 2 QR Code.
 * Returns Base64 encoded TLV byte string.
 */
export function encodeZatcaInvoice(payload: ZatcaInvoicePayload): string {
  if (!payload.sellerName) throw new Error("Seller name is required for ZATCA invoice");
  const vatNumber = payload.vatRegistrationNumber || (payload as any).vatNumber;
  if (!vatNumber) throw new Error("VAT registration number is required for ZATCA invoice");
  if (!payload.timestamp) throw new Error("Timestamp is required for ZATCA invoice");

  const total = payload.totalWithVat !== undefined ? String(payload.totalWithVat) : (payload as any).total !== undefined ? String((payload as any).total) : "0.00";
  const vat = payload.vatTotal !== undefined ? String(payload.vatTotal) : (payload as any).vat !== undefined ? String((payload as any).vat) : "0.00";

  const chunks: Uint8Array[] = [
    toTlvChunk(1, payload.sellerName),
    toTlvChunk(2, vatNumber),
    toTlvChunk(3, payload.timestamp),
    toTlvChunk(4, total),
    toTlvChunk(5, vat)
  ];

  if (payload.xmlHash) chunks.push(toTlvChunk(6, payload.xmlHash));
  if (payload.digitalSignature) chunks.push(toTlvChunk(7, payload.digitalSignature));
  if (payload.publicKey) chunks.push(toTlvChunk(8, payload.publicKey));
  if (payload.caSignature) chunks.push(toTlvChunk(9, payload.caSignature));

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const masterBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    masterBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(masterBuffer).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < masterBuffer.length; i++) {
    binary += String.fromCharCode(masterBuffer[i]);
  }
  return btoa(binary);
}

/**
 * Decodes Saudi Arabia ZATCA Base64 TLV byte string back into a key-value dictionary and named fields.
 */
export function decodeZatcaInvoice(base64Tlv: string): Record<string | number, string> {
  let bytes: Uint8Array;
  if (typeof Buffer !== "undefined") {
    bytes = new Uint8Array(Buffer.from(base64Tlv, "base64"));
  } else {
    const binary = atob(base64Tlv);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
  }

  const decoder = new TextDecoder();
  const tags: Record<string | number, string> = {};
  let i = 0;

  while (i < bytes.length) {
    const tag = bytes[i];
    const len = bytes[i + 1];
    const valBytes = bytes.slice(i + 2, i + 2 + len);
    tags[tag] = decoder.decode(valBytes);
    i += 2 + len;
  }

  if (tags[1]) tags.sellerName = tags[1];
  if (tags[2]) {
    tags.vatRegistrationNumber = tags[2];
    tags.vatNumber = tags[2];
  }
  if (tags[3]) tags.timestamp = tags[3];
  if (tags[4]) tags.totalWithVat = tags[4];
  if (tags[5]) tags.vatTotal = tags[5];
  if (tags[6]) tags.xmlHash = tags[6];
  if (tags[7]) tags.digitalSignature = tags[7];
  if (tags[8]) tags.publicKey = tags[8];
  if (tags[9]) tags.caSignature = tags[9];

  return tags;
}
