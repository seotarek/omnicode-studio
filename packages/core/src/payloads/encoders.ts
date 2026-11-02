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
