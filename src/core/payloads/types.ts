export type PayloadCategory =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "wifi"
  | "vcard"
  | "geo"
  | "calendar"
  | "crypto";

export interface WifiPayload {
  ssid: string;
  password?: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}

export interface VCardPayload {
  firstName: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
}

export interface CalendarPayload {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}

export interface WhatsAppPayload {
  phone: string;
  text?: string;
}

export interface EmailPayload {
  to: string;
  subject?: string;
  body?: string;
}

export interface CryptoPayload {
  currency: "BTC" | "ETH" | "USDT" | string;
  address: string;
  amount?: number;
  message?: string;
}

export interface GS1DigitalLinkPayload {
  domain?: string;
  gtin: string;
  lot?: string;
  serial?: string;
  cpv?: string;
  expiryDate?: string;
  attributes?: Record<string, string>;
}

export interface EpcSepaPayload {
  beneficiaryName: string;
  iban: string;
  bic?: string;
  amount?: number;
  purpose?: string;
  remittanceReference?: string;
  remittanceInformation?: string;
  beneficiaryOriginatorInfo?: string;
  version?: "001" | "002";
}

export interface ZatcaInvoicePayload {
  sellerName: string;
  vatRegistrationNumber: string;
  timestamp: string;
  totalWithVat: string | number;
  vatTotal: string | number;
  xmlHash?: string;
  digitalSignature?: string;
  publicKey?: string;
  caSignature?: string;
}

