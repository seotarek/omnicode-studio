import JsBarcode from "jsbarcode";

export type BarcodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "ITF14"
  | "MSI"
  | "pharmacode"
  | "codabar";

export interface BarcodeOptions {
  format: BarcodeFormat;
  data: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  lineColor?: string;
  background?: string;
  fontSize?: number;
  margin?: number;
}

export function validateBarcodeData(format: BarcodeFormat, data: string): { isValid: boolean; error?: string } {
  if (!data) return { isValid: false, error: "Data cannot be empty" };

  switch (format) {
    case "EAN13":
      if (!/^\d{12,13}$/.test(data)) {
        return { isValid: false, error: "EAN-13 must be 12 or 13 numeric digits" };
      }
      break;
    case "EAN8":
      if (!/^\d{7,8}$/.test(data)) {
        return { isValid: false, error: "EAN-8 must be 7 or 8 numeric digits" };
      }
      break;
    case "UPC":
      if (!/^\d{11,12}$/.test(data)) {
        return { isValid: false, error: "UPC-A must be 11 or 12 numeric digits" };
      }
      break;
    case "ITF14":
      if (!/^\d{13,14}$/.test(data)) {
        return { isValid: false, error: "ITF-14 must be 13 or 14 numeric digits" };
      }
      break;
    case "pharmacode":
      const num = parseInt(data, 10);
      if (isNaN(num) || num < 3 || num > 131070) {
        return { isValid: false, error: "Pharmacode must be an integer between 3 and 131070" };
      }
      break;
    case "CODE39":
      // Standard CODE39 strictly allows uppercase, numbers, and - . $ / + % SPACE
      if (!/^[0-9A-Z\-\.\ \$\/\+\%]+$/.test(data)) {
        return { isValid: false, error: "CODE39 only supports uppercase alphanumeric and - . $ / + %" };
      }
      break;
    default:
      break;
  }
  return { isValid: true };
}

export function generateBarcodeSVG(options: BarcodeOptions): string {
  const validation = validateBarcodeData(options.format, options.data);
  if (!validation.isValid) {
    throw new Error(validation.error || "Invalid barcode data");
  }

  if (typeof document !== "undefined") {
    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svgNode, options.data, {
      format: options.format,
      width: options.width || 2,
      height: options.height || 100,
      displayValue: options.displayValue ?? true,
      lineColor: options.lineColor || "#000000",
      background: options.background || "#ffffff",
      fontSize: options.fontSize || 16,
      margin: options.margin || 10
    });
    return new XMLSerializer().serializeToString(svgNode);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg"><text>${options.data}</text></svg>`;
}
