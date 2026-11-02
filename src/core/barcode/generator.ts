
function sanitizeSvgText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


/**
 * Calculates GS1 Modulo 10 Check Digit (for EAN-13, EAN-8, UPC-A, ITF-14)
 * Weight alternation: for EAN-13 / UPC-A / EAN-8 / ITF-14
 */
export function calculateMod10CheckDigit(digits: string): number {
  let sum = 0;
  const len = digits.length;
  // Starting from the rightmost payload digit backwards:
  // Odd positions from right get weight 3, even get weight 1
  for (let i = len - 1, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3) {
    sum += parseInt(digits[i], 10) * weight;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

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

export type BarcodeStyle =
  | "classic"       // Standard industrial rectangle
  | "rounded"       // Modern rounded bars (rx/ry)
  | "pill"          // Fully rounded pill caps
  | "gradient"      // Linear gradient across bars
  | "badge-frame"   // Surrounded with ticket/badge border
  | "minimal"       // Clean lines, elevated typography
  | "thermal-label" // Courier font, high-density industrial warehouse label
  | "price-tag";    // Retail tag with currency banner

export interface BarcodeOptions {
  format: BarcodeFormat;
  data: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  lineColor?: string;
  lineColor2?: string;
  background?: string;
  fontSize?: number;
  margin?: number;
  style?: BarcodeStyle;
  headerText?: string;
  footerText?: string;
  fontFamily?: string;
}

export function validateBarcodeData(format: BarcodeFormat, data: string): { isValid: boolean; error?: string } {
  if (!data) return { isValid: false, error: "Data cannot be empty" };

  switch (format) {
    case "EAN13": {
      if (!/^\d{12,13}$/.test(data)) {
        return { isValid: false, error: "EAN-13 must be 12 or 13 numeric digits" };
      }
      if (data.length === 13) {
        const expected = calculateMod10CheckDigit(data.slice(0, 12));
        const actual = parseInt(data[12], 10);
        if (expected !== actual) {
          return { isValid: false, error: `Invalid EAN-13 check digit: expected ${expected}, got ${actual}` };
        }
      }
      break;
    }
    case "EAN8": {
      if (!/^\d{7,8}$/.test(data)) {
        return { isValid: false, error: "EAN-8 must be 7 or 8 numeric digits" };
      }
      if (data.length === 8) {
        const expected = calculateMod10CheckDigit(data.slice(0, 7));
        const actual = parseInt(data[7], 10);
        if (expected !== actual) {
          return { isValid: false, error: `Invalid EAN-8 check digit: expected ${expected}, got ${actual}` };
        }
      }
      break;
    }
    case "UPC": {
      if (!/^\d{11,12}$/.test(data)) {
        return { isValid: false, error: "UPC-A must be 11 or 12 numeric digits" };
      }
      if (data.length === 12) {
        const expected = calculateMod10CheckDigit(data.slice(0, 11));
        const actual = parseInt(data[11], 10);
        if (expected !== actual) {
          return { isValid: false, error: `Invalid UPC-A check digit: expected ${expected}, got ${actual}` };
        }
      }
      break;
    }
    case "ITF14": {
      if (!/^\d{13,14}$/.test(data)) {
        return { isValid: false, error: "ITF-14 must be 13 or 14 numeric digits" };
      }
      if (data.length === 14) {
        const expected = calculateMod10CheckDigit(data.slice(0, 13));
        const actual = parseInt(data[13], 10);
        if (expected !== actual) {
          return { isValid: false, error: `Invalid ITF-14 check digit: expected ${expected}, got ${actual}` };
        }
      }
      break;
    }
    case "pharmacode": {
      if (!/^\d+$/.test(data)) {
        return { isValid: false, error: "Pharmacode must contain only numeric digits" };
      }
      const num = parseInt(data, 10);
      if (isNaN(num) || num < 3 || num > 131070) {
        return { isValid: false, error: "Pharmacode value must be strictly between 3 and 131070" };
      }
      break;
    }
    case "CODE39": {
      if (!/^[0-9A-Z\-\.\ \$\+\%]+$/.test(data)) {
        return { isValid: false, error: "CODE39 only supports uppercase alphanumeric and - . $ / + %" };
      }
      break;
    }
    case "codabar": {
      if (!/^[A-Da-d][0-9\-\$\:\/\.\+]+[A-Da-d]$/.test(data)) {
        return { isValid: false, error: "Codabar must start and end with A, B, C, or D" };
      }
      break;
    }
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

  if (typeof document === "undefined") {
    return "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>" + options.data + "</text></svg>";
  }

  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const style = options.style || "classic";
  const isMinimal = style === "minimal";
  const isThermal = style === "thermal-label";
  const isPriceTag = style === "price-tag";
  const isBadge = style === "badge-frame";
  const isGradient = style === "gradient";
  const isRounded = style === "rounded" || style === "pill";

  // Base JsBarcode generation
  JsBarcode(svgNode, options.data, {
    format: options.format,
    width: options.width || 2,
    height: options.height || 100,
    displayValue: options.displayValue ?? !isMinimal,
    lineColor: isGradient ? "url(#barcode-grad)" : (options.lineColor || "#000000"),
    background: isBadge || isPriceTag || isThermal ? "transparent" : (options.background || "#ffffff"),
    fontSize: isThermal ? 14 : (options.fontSize || 16),
    font: isThermal ? "Courier New, monospace" : (options.fontFamily || "monospace"),
    margin: isBadge || isPriceTag || isThermal ? 4 : (options.margin || 10)
  });

  // Extract raw SVG width and height
  const baseWidth = parseFloat(svgNode.getAttribute("width") || "300");
  const baseHeight = parseFloat(svgNode.getAttribute("height") || "120");

  // Apply bar curve styles if rounded or pill
  if (isRounded) {
    const rx = style === "pill" ? "4" : "2";
    const rects = svgNode.querySelectorAll("rect");
    rects.forEach((rect, idx) => {
      if (idx > 0 || !rect.getAttribute("fill")) {
        rect.setAttribute("rx", rx);
        rect.setAttribute("ry", rx);
      }
    });
  }

  // Inject gradient definition if requested
  if (isGradient) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML =
      "<linearGradient id=\"barcode-grad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">" +
      "<stop offset=\"0%\" stop-color=\"" + (options.lineColor || "#059669") + "\" />" +
      "<stop offset=\"100%\" stop-color=\"" + (options.lineColor2 || "#2563eb") + "\" />" +
      "</linearGradient>";
    svgNode.insertBefore(defs, svgNode.firstChild);
  }

  // Wrap inside Advanced Frames / Presets (Thermal Label, Price Tag, Badge Frame)
  if (isBadge || isPriceTag || isThermal) {
    const pad = 24;
    const headerH = (isThermal || isPriceTag || options.headerText) ? 28 : 10;
    const footerH = (isThermal || isPriceTag || options.footerText) ? 24 : 10;
    const totalW = baseWidth + pad * 2;
    const totalH = baseHeight + pad * 2 + headerH + footerH;

    const sanitizedHeader = options.headerText ? sanitizeSvgText(options.headerText) : "";
    const sanitizedFooter = options.footerText ? sanitizeSvgText(options.footerText) : "";

    const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wrapper.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    wrapper.setAttribute("viewBox", "0 0 " + totalW + " " + totalH);
    wrapper.setAttribute("width", String(totalW));
    wrapper.setAttribute("height", String(totalH));

    const bgFill = options.background || "#ffffff";
    let frameMarkup = "";

    if (isThermal) {
      // Industrial shipping / warehouse label
      frameMarkup =
        "<rect width=\"" + totalW + "\" height=\"" + totalH + "\" fill=\"" + bgFill + "\" stroke=\"#000000\" stroke-width=\"3\" rx=\"4\" />" +
        "<line x1=\"0\" y1=\"" + (headerH + 16) + "\" x2=\"" + totalW + "\" y2=\"" + (headerH + 16) + "\" stroke=\"#000000\" stroke-width=\"2\" />" +
        "<text x=\"" + pad + "\" y=\"" + (headerH + 4) + "\" font-family=\"Courier New, monospace\" font-weight=\"bold\" font-size=\"13\" fill=\"#000000\">" + (sanitizedHeader || "LOGISTICS SHIPMENT TRACKING") + "</text>" +
        "<line x1=\"0\" y1=\"" + (totalH - footerH - 12) + "\" x2=\"" + totalW + "\" y2=\"" + (totalH - footerH - 12) + "\" stroke=\"#000000\" stroke-width=\"2\" />" +
        "<text x=\"" + pad + "\" y=\"" + (totalH - 12) + "\" font-family=\"Courier New, monospace\" font-size=\"11\" fill=\"#333333\">" + (sanitizedFooter || ("FORMAT: " + options.format + " | CARRIER APPROVED")) + "</text>";
    } else if (isPriceTag) {
      // Retail store price sticker
      frameMarkup =
        "<rect width=\"" + totalW + "\" height=\"" + totalH + "\" fill=\"" + bgFill + "\" stroke=\"#e2e8f0\" stroke-width=\"2\" rx=\"12\" />" +
        "<rect x=\"0\" y=\"0\" width=\"" + totalW + "\" height=\"" + (headerH + 12) + "\" fill=\"" + (options.lineColor || "#059669") + "\" rx=\"12\" />" +
        "<rect x=\"0\" y=\"" + headerH + "\" width=\"" + totalW + "\" height=\"12\" fill=\"" + (options.lineColor || "#059669") + "\" />" +
        "<text x=\"" + (totalW / 2) + "\" y=\"" + (headerH + 2) + "\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"13\" fill=\"#ffffff\" text-anchor=\"middle\">" + (sanitizedHeader || "STORE INVENTORY ITEM") + "</text>" +
        "<text x=\"" + (totalW / 2) + "\" y=\"" + (totalH - 10) + "\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"14\" fill=\"" + (options.lineColor || "#059669") + "\" text-anchor=\"middle\">" + (sanitizedFooter || "PRICE: $99.99") + "</text>";
    } else if (isBadge) {
      // Modern badge ticket frame
      frameMarkup =
        "<rect width=\"" + totalW + "\" height=\"" + totalH + "\" fill=\"" + bgFill + "\" stroke=\"" + (options.lineColor || "#3b82f6") + "\" stroke-width=\"2\" stroke-dasharray=\"6 4\" rx=\"16\" />" +
        "<circle cx=\"0\" cy=\"" + (totalH / 2) + "\" r=\"10\" fill=\"#0f172a\" />" +
        "<circle cx=\"" + totalW + "\" cy=\"" + (totalH / 2) + "\" r=\"10\" fill=\"#0f172a\" />" +
        "<text x=\"" + (totalW / 2) + "\" y=\"" + (headerH + 6) + "\" font-family=\"sans-serif\" font-size=\"11\" font-weight=\"bold\" fill=\"#64748b\" text-anchor=\"middle\" letter-spacing=\"2\">" + (sanitizedHeader || "OFFICIAL VERIFICATION BADGE") + "</text>";
    }

    const barcodeG = "<g transform=\"translate(" + pad + ", " + (headerH + pad) + ")\">" + svgNode.innerHTML + "</g>";
    wrapper.innerHTML = frameMarkup + barcodeG;
    return new XMLSerializer().serializeToString(wrapper);
  }

  return new XMLSerializer().serializeToString(svgNode);
}
