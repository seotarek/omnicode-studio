import { QRCodeRenderer, type RenderResult } from "./qr/renderer.js";
import type { QRCodeOptions } from "./qr/types.js";
import {
  generateBarcodeSVG,
  validateBarcodeData,
  calculateMod10CheckDigit,
  type BarcodeFormat,
  type BarcodeOptions,
  type BarcodeValidationResult
} from "./barcode/generator.js";
import {
  validateScannability,
  calculateContrast,
  type ScannabilityOptions,
  type ValidationResult
} from "./validator/scannability.js";
import { DESIGN_PRESETS } from "./presets.js";

export interface OmniCodePlugin {
  name: string;
  version: string;
  onBeforeGenerate?: (type: "qr" | "barcode", options: any) => any;
  onAfterGenerate?: (type: "qr" | "barcode", result: any) => any;
}

export interface BatchItem {
  id?: string | number;
  type: "qr" | "barcode";
  options: any;
}

export interface BatchResult {
  id?: string | number;
  type: "qr" | "barcode";
  success: boolean;
  svg?: string;
  error?: string;
  format?: string;
}

export class OmniCode {
  private static plugins: OmniCodePlugin[] = [];

  /**
   * Register an extensible plugin hook into OmniCode Core.
   */
  public static registerPlugin(plugin: OmniCodePlugin): void {
    if (!plugin || !plugin.name) {
      throw new Error("Plugin must have a valid name");
    }
    const existingIndex = this.plugins.findIndex((p) => p.name === plugin.name);
    if (existingIndex >= 0) {
      this.plugins[existingIndex] = plugin;
    } else {
      this.plugins.push(plugin);
    }
  }

  /**
   * Retrieve all currently registered plugins.
   */
  public static getPlugins(): OmniCodePlugin[] {
    return [...this.plugins];
  }

  /**
   * Generate an enterprise QR Code SVG using the standard ISO/IEC 18004 renderer.
   */
  public static generateQr(options: QRCodeOptions): RenderResult {
    let opts = { ...options };
    for (const plugin of this.plugins) {
      if (plugin.onBeforeGenerate) {
        opts = plugin.onBeforeGenerate("qr", opts) || opts;
      }
    }

    const renderer = new QRCodeRenderer(opts);
    let result = renderer.render();

    for (const plugin of this.plugins) {
      if (plugin.onAfterGenerate) {
        result = plugin.onAfterGenerate("qr", result) || result;
      }
    }

    return result;
  }

  /**
   * Generate a verified 1D barcode SVG.
   */
  public static generateBarcode(options: BarcodeOptions): string {
    let opts = { ...options };
    for (const plugin of this.plugins) {
      if (plugin.onBeforeGenerate) {
        opts = plugin.onBeforeGenerate("barcode", opts) || opts;
      }
    }

    let svg = generateBarcodeSVG(opts);

    for (const plugin of this.plugins) {
      if (plugin.onAfterGenerate) {
        svg = plugin.onAfterGenerate("barcode", svg) || svg;
      }
    }

    return svg;
  }

  /**
   * Validate barcode data and check-digit compliance against symbology rules.
   */
  public static validateBarcode(format: BarcodeFormat, data: string): BarcodeValidationResult {
    return validateBarcodeData(format, data);
  }

  /**
   * Verify optical contrast, error correction tolerance, and scannability heuristics.
   */
  public static validateScannability(options: ScannabilityOptions): ValidationResult {
    return validateScannability(options);
  }

  /**
   * Calculate W3C relative luminance contrast ratio.
   */
  public static calculateContrast(fgColor: string, bgColor: string): number {
    return calculateContrast(fgColor, bgColor);
  }

  /**
   * Calculate Modulo-10 Luhn/GS1 Check Digit.
   */
  public static calculateCheckDigit(payloadDigits: string): number {
    return calculateMod10CheckDigit(payloadDigits);
  }

  /**
   * Returns a complete list of supported symbologies, QR parameters, and built-in presets.
   */
  public static getSupportedFormats(): {
    barcodes: BarcodeFormat[];
    qrErrorLevels: string[];
    presets: string[];
  } {
    return {
      barcodes: [
        "CODE128",
        "EAN13",
        "EAN8",
        "UPC",
        "ITF14",
        "MSI",
        "pharmacode",
        "codabar"
      ],
      qrErrorLevels: ["L", "M", "Q", "H"],
      presets: Object.keys(DESIGN_PRESETS)
    };
  }

  /**
   * Batch processes a queue of QR and barcode items.
   */
  public static batch(items: BatchItem[]): BatchResult[] {
    if (!Array.isArray(items)) {
      throw new Error("Batch items must be an array");
    }

    return items.map((item, index) => {
      const id = item.id !== undefined ? item.id : index;
      try {
        if (item.type === "qr") {
          const res = this.generateQr(item.options);
          return {
            id,
            type: "qr",
            success: true,
            format: "svg",
            svg: res.svgString
          };
        } else if (item.type === "barcode") {
          const validation = this.validateBarcode(item.options.format, item.options.data);
          if (!validation.isValid) {
            return {
              id,
              type: "barcode",
              success: false,
              error: validation.error || "Invalid barcode data",
              format: item.options.format
            };
          }
          const svg = this.generateBarcode(item.options);
          return {
            id,
            type: "barcode",
            success: true,
            format: item.options.format,
            svg
          };
        } else {
          return {
            id,
            type: item.type,
            success: false,
            error: `Unsupported item type: ${item.type}`
          };
        }
      } catch (err: any) {
        return {
          id,
          type: item.type,
          success: false,
          error: err.message || "Failed to process item"
        };
      }
    });
  }

  /**
   * Convert SVG string to Base64 encoded string.
   */
  public static toBase64(svg: string): string {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(svg).toString("base64");
    }
    if (typeof btoa !== "undefined") {
      return btoa(unescape(encodeURIComponent(svg)));
    }
    throw new Error("Base64 encoding not supported in this runtime environment");
  }

  /**
   * Convert SVG string to Data URL format.
   */
  public static toDataUrl(svg: string, mimeType = "image/svg+xml"): string {
    const base64 = this.toBase64(svg);
    return `data:${mimeType};base64,${base64}`;
  }
}
