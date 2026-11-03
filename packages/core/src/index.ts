// QR Code
export { QRCodeRenderer, type RenderResult } from "./qr/renderer.js";
export type {
  QRCodeOptions,
  DotType,
  CornerSquareType,
  CornerDotType,
  ErrorCorrectionLevel,
  ColorOrGradient,
  GradientOptions,
  ColorStop,
  LogoOptions
} from "./qr/types.js";

// Barcode
export {
  generateBarcodeSVG,
  validateBarcodeData,
  calculateMod10CheckDigit,
  type BarcodeFormat,
  type BarcodeStyle,
  type BarcodeOptions,
  type BarcodeValidationResult
} from "./barcode/generator.js";

// Payloads & Encoders / Decoders
export {
  encodeWifi,
  encodeVCard,
  encodeWhatsApp,
  encodeEmail,
  encodeCrypto,
  encodeGs1DigitalLink,
  encodeEpcSepa,
  encodeZatcaInvoice,
  decodeZatcaInvoice
} from "./payloads/encoders.js";
export {
  decodeGs1DigitalLink,
  decodeEpcSepa,
  decodeWifi,
  decodeVCard
} from "./payloads/decoders.js";
export type {
  WifiPayload,
  VCardPayload,
  WhatsAppPayload,
  EmailPayload,
  CryptoPayload,
  GS1DigitalLinkPayload,
  EpcSepaPayload,
  ZatcaInvoicePayload
} from "./payloads/types.js";


// Scannability & Validation
export {
  calculateContrast,
  validateScannability,
  type ScannabilityOptions,
  type ValidationResult
} from "./validator/scannability.js";

// Presets
export { DESIGN_PRESETS, type DesignPreset } from "./presets.js";

// Unified Engine & Plugin Architecture
export {
  OmniCode,
  type OmniCodePlugin,
  type BatchItem,
  type BatchResult
} from "./engine.js";

// Export Utilities
export {
  svgToEps,
  type EpsExportOptions
} from "./export/eps.js";

