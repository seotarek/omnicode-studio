# OmniCode Studio: Enterprise QR Code & Barcode Suite

[![Deploy to GitHub Pages](https://github.com/seotarek/omnicode-studio/actions/workflows/deploy.yml/badge.svg)](https://github.com/seotarek/omnicode-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-059669.svg)](https://opensource.org/licenses/MIT)
[![Tests: Vitest](https://img.shields.io/badge/Tests-8%20Passing-0284c7.svg)](tests/)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict%205.x-2563eb.svg)](tsconfig.json)
[![Privacy: Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-7c3aed.svg)](#privacy-and-security)

Client-side vector barcode and QR code generation suite. Engineered for logistics, enterprise applications, and developers requiring zero external network requests, precise SVG vector output, automated scannability verification, and full bilingual support (English and Arabic).

---

## Live Application

- Web App: [https://seotarek.github.io/omnicode-studio/](https://seotarek.github.io/omnicode-studio/)
- Architecture: 100% client-side computation. Runs entirely within the browser with zero external API dependencies or telemetry.

---

## Technical Capabilities

### 1. Vector QR Code Engine
- Module Topologies: square, rounded, dots, classy, classy-rounded, extra-rounded.
- Corner Eyes: Independent geometry configuration for outer squares and inner dots.
- Gradient Fills: Linear and radial two-tone gradient transitions.
- Brand Assets: Custom logo embedding with automatic quiet-zone clipping to prevent decoding failures.
- Standard Formats: WiFi (WPA/WEP/nopass), vCard 3.0, WhatsApp direct links, Email, SMS, Phone, Geo coordinates, and iCalendar events.

### 2. Barcode Generation Engine
- Supported Symbologies:
  - CODE128 (Auto A/B/C) - Logistics, shipping containers, asset tracking.
  - EAN-13 and EAN-8 - International retail product packaging with checksum verification.
  - UPC-A - Standard North American retail.
  - CODE39 - Industrial, defense, and automotive inventory management.
  - ITF-14 - Corrugated master carton identification.
  - Pharmacode - Pharmaceutical packaging and safety verification.
- Format Validation: Real-time checksum and regex validation before output generation.

### 3. ISO Scannability & Contrast Evaluation
- Evaluates WCAG 2.2 Relative Luminance Contrast Ratio between foreground and background colors.
- Provides real-time warnings when color combinations fall below ISO 18004 readability standards.

### 4. Client-Side Batch Processing
- Import line-delimited records or CSV files.
- Generates batch vector SVGs in browser memory and downloads a bundled ZIP archive without transmitting data to a server.

### 5. Multi-Format High-Resolution Export
- Vector: Scalable SVG strings.
- Raster: High-density PNG (1200x1200px), WebP, and JPEG.
- Print PDF: ISO-compliant PDF documents with standard print margins.
- Direct Copy: Clipboard SVG export for direct insertion into Figma, Illustrator, or Inkscape.

### 6. Bidirectional Architecture (LTR / RTL)
- Full Arabic (RTL) and English (LTR) interface translations with CSS logical property layout parity.

---

## Architecture & Codebase Structure

```
omnicode-studio/
├── src/
│   ├── core/                  # Headless core generation engine (zero DOM dependencies)
│   │   ├── qr/                # Scalable dot & corner SVG algorithms
│   │   ├── barcode/           # Symbology validators & barcode generators
│   │   ├── payloads/          # Standard payload builders (WiFi, vCard, etc.)
│   │   ├── validator/         # WCAG contrast & ISO scannability evaluation
│   │   ├── export.ts          # SVG, Canvas, PDF, and ZIP export pipelines
│   │   └── presets.ts         # High-contrast aesthetic presets
│   ├── i18n/                  # English and Arabic locale dictionaries
│   ├── App.tsx                # Studio interface (React and Tailwind CSS)
│   └── main.tsx               # Application bootstrap
├── docs/
│   └── ENTERPRISE_INTEGRATION_ROADMAP.md # Integration architecture for Laravel and WordPress
└── tests/unit/                # Vitest unit test suite
```

---

## Local Development & Testing

```bash
# Clone the repository
git clone https://github.com/seotarek/omnicode-studio.git
cd omnicode-studio

# Install dependencies
npm install

# Run unit test suite
npm test

# Launch local development server
npm run dev

# Compile production bundle
npm run build
```

---

## Integration Roadmap (Laravel & WordPress)

A complete architectural specification is available in the [Enterprise Integration Roadmap](docs/ENTERPRISE_INTEGRATION_ROADMAP.md), covering:
- `omnicode/laravel-omnicode`: Fluent facade, Blade directives, and queueable batch generation for Laravel applications.
- `omnicode-wp`: Native Gutenberg custom block and automated WooCommerce fulfillment order labeling.

---

## Privacy and Security

- Client-Side Isolation: All mathematical calculations, encoding algorithms, and raster conversions execute in the user browser.
- Data Confidentiality: Sensitive parameters (WiFi credentials, contact details, internal URLs) are never transmitted over the network.
- Open Source: Licensed under the MIT License.

---

## License

MIT License. See [LICENSE](LICENSE) for full terms.
