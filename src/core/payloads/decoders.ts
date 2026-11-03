import {
  WifiPayload,
  VCardPayload,
  GS1DigitalLinkPayload,
  EpcSepaPayload
} from "./types";

/**
 * Decodes GS1 Digital Link standard URI back into structured payload.
 */
export function decodeGs1DigitalLink(uri: string): GS1DigitalLinkPayload {
  const url = new URL(uri);
  const domain = `${url.protocol}//${url.host}`;
  const segments = url.pathname.split("/").filter(Boolean);

  let gtin = "";
  let lot: string | undefined;
  let serial: string | undefined;
  let cpv: string | undefined;

  for (let i = 0; i < segments.length; i += 2) {
    const ai = segments[i];
    const val = decodeURIComponent(segments[i + 1] || "");
    if (ai === "01") {
      gtin = val;
    } else if (ai === "10") {
      lot = val;
    } else if (ai === "21") {
      serial = val;
    } else if (ai === "22") {
      cpv = val;
    }
  }

  const expiryDate = url.searchParams.get("17") || undefined;
  const attributes: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    if (k !== "17") {
      attributes[k] = v;
    }
  });

  return {
    gtin,
    domain,
    lot,
    serial,
    cpv,
    expiryDate,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined
  };
}

/**
 * Decodes EPC SEPA QR Code (EPC069-12 format) back into structured payload.
 */
export function decodeEpcSepa(payload: string): EpcSepaPayload {
  const lines = payload.replace(/\r\n/g, "\n").split("\n");
  if (lines.length < 7 || lines[0] !== "BCD") {
    throw new Error("Invalid EPC SEPA payload: missing BCD service header");
  }

  const bic = lines[4] || undefined;
  const beneficiaryName = lines[5] || "";
  const iban = lines[6] || "";

  let amount: number | undefined;
  const currency = "EUR";
  const amountLine = lines[7] || "";
  if (amountLine.startsWith("EUR")) {
    amount = parseFloat(amountLine.substring(3)) || undefined;
  }

  const purposeCode = lines[8] || undefined;
  const remittanceReference = lines[9] || undefined;
  const remittanceText = lines[10] || undefined;

  return {
    beneficiaryName,
    iban,
    bic,
    amount,
    currency,
    purposeCode,
    remittanceReference,
    remittanceInformation: remittanceText
  };
}

/**
 * Decodes WiFi connection string back into structured payload.
 */
export function decodeWifi(payload: string): WifiPayload {
  if (!payload.startsWith("WIFI:")) {
    throw new Error("Invalid WiFi QR string");
  }

  const content = payload.slice(5).replace(/;;$/, "");
  const fields: Record<string, string> = {};

  let currentKey = "";
  let currentValue = "";
  let isEscaped = false;
  let inKey = true;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (isEscaped) {
      currentValue += ch;
      isEscaped = false;
      continue;
    }

    if (ch === "\\") {
      isEscaped = true;
      continue;
    }

    if (inKey) {
      if (ch === ":") {
        inKey = false;
      } else {
        currentKey += ch;
      }
    } else {
      if (ch === ";") {
        if (currentKey) {
          fields[currentKey] = currentValue;
        }
        currentKey = "";
        currentValue = "";
        inKey = true;
      } else {
        currentValue += ch;
      }
    }
  }

  if (currentKey && currentValue) {
    fields[currentKey] = currentValue;
  }

  return {
    ssid: fields["S"] || "",
    password: fields["P"] || "",
    encryption: (fields["T"] as any) || "WPA",
    hidden: fields["H"]?.toLowerCase() === "true"
  };
}

/**
 * Decodes vCard 3.0 / 4.0 string back into structured payload.
 */
export function decodeVCard(payload: string): VCardPayload {
  const lines = payload.replace(/\r\n/g, "\n").split("\n");
  let firstName = "";
  let lastName = "";
  let organization: string | undefined;
  let title: string | undefined;
  let phone: string | undefined;
  let email: string | undefined;
  let url: string | undefined;
  let address: string | undefined;

  for (const line of lines) {
    if (line.startsWith("N:")) {
      const parts = line.substring(2).split(";");
      lastName = parts[0] || "";
      firstName = parts[1] || "";
    } else if (line.startsWith("ORG:")) {
      organization = line.substring(4);
    } else if (line.startsWith("TITLE:")) {
      title = line.substring(6);
    } else if (line.startsWith("TEL") && line.includes(":")) {
      phone = line.substring(line.indexOf(":") + 1);
    } else if (line.startsWith("EMAIL") && line.includes(":")) {
      email = line.substring(line.indexOf(":") + 1);
    } else if (line.startsWith("URL:")) {
      url = line.substring(4);
    } else if (line.startsWith("ADR") && line.includes(":")) {
      const parts = line.substring(line.indexOf(":") + 1).split(";");
      address = parts.filter(Boolean).join(", ");
    }
  }

  return {
    firstName,
    lastName,
    organization,
    title,
    phone,
    email,
    url,
    address
  };
}
