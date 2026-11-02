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
