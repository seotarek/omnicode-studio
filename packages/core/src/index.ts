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

// Payloads & Encoders
export {
  encodeWifi,
  encodeVCard,
  encodeWhatsApp,
  encodeEmail,
  encodeCrypto
} from "./payloads/encoders.js";
export type {
  WifiPayload,
  VCardPayload,
  WhatsAppPayload,
  EmailPayload,
  CryptoPayload
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
