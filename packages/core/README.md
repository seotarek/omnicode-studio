# @omnicode/core

Enterprise-grade, headless, environment-agnostic barcode and QR code generation, validation, and encoding engine.

Works seamlessly across **Node.js**, **Browsers**, **Bun**, **Deno**, and **Edge Functions**.

## Features

- **Headless Execution**: Zero browser or canvas requirements. Generates vector SVG and matrices directly in memory.
- **GS1 Modulo 10 Verification**: Strict check digit verification for EAN-13, EAN-8, UPC-A, and ITF-14.
- **Symbologies Supported**: CODE128, CODE39, EAN-13, EAN-8, UPC-A, ITF-14, Pharmacode, Codabar.
- **QR Code Geometries**: Square, Rounded, Extra-Rounded, Classy, Dots, Diamond, Star, Horizontal & Vertical Bars.
- **Preset Styles**: Industrial thermal labels, retail shelf price tags, event ticket badges, and sleek minimal aesthetics.
- **Built-in Encoders**: WiFi (WPA/WEP), vCard 3.0, WhatsApp, Email, Phone, SMS, Geo, Calendar, and Cryptocurrency.
- **Scannability Diagnostics**: Contrast ratio calculation, ISO scannability scoring, and automated compliance warnings.

## Installation

```bash
npm install @omnicode/core
```

## Quick Start

### 1. Generate Headless QR Code SVG

```typescript
import { QRCodeRenderer } from "@omnicode/core";

const renderer = new QRCodeRenderer({
  width: 400,
  height: 400,
  margin: 16,
  data: "https://omnicode.studio",
  errorCorrectionLevel: "H",
  dotsOptions: {
    type: "rounded",
    colorOrGradient: { color: "#059669" }
  },
  cornersSquareOptions: {
    type: "extra-rounded",
    colorOrGradient: { color: "#047857" }
  },
  cornersDotOptions: {
    type: "dot",
    colorOrGradient: { color: "#047857" }
  },
  backgroundOptions: {
    color: "#ffffff"
  }
});

const result = renderer.render();
console.log(result.svgString); // Vector SVG markup
console.log(result.matrix);    // Boolean matrix array
```

### 2. Generate Industrial Barcode SVG

```typescript
import { generateBarcodeSVG, validateBarcodeData } from "@omnicode/core";

// Validate payload before generation
const validation = validateBarcodeData("EAN13", "1234567890128");
if (!validation.isValid) {
  throw new Error(validation.error);
}

// Generate styled thermal warehouse label
const svg = generateBarcodeSVG({
  format: "CODE128",
  data: "LOGISTICS-9942",
  style: "thermal-label",
  headerText: "WAREHOUSE AIR SHIPMENT",
  footerText: "CARRIER VERIFIED"
});
```

### 3. Contrast & Scannability Scoring

```typescript
import { validateScannability, calculateContrast } from "@omnicode/core";

const contrast = calculateContrast("#059669", "#ffffff");
console.log(`Contrast ratio: ${contrast.toFixed(2)}:1`);

const diagnostics = validateScannability({
  fgColor: "#059669",
  bgColor: "#ffffff",
  errorCorrectionLevel: "H",
  hasLogo: true,
  logoRatio: 0.2
});

console.log(`Scannability score: ${diagnostics.score}/100`);
```

## License

MIT © OmniCode Studio Core Team
