# 🌐 OmniCode Studio: Enterprise QR Code & Barcode Ecosystem

[![Deploy to GitHub Pages](https://github.com/seotarek/omnicode-studio/actions/workflows/deploy.yml/badge.svg)](https://github.com/seotarek/omnicode-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Tests: Vitest](https://img.shields.io/badge/Tests-8%20Passing-brightgreen.svg)](tests/)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict%205.x-blue.svg)](tsconfig.json)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-purple.svg)](#privacy--security-guarantees)

> **OmniCode Studio** is an open-source, privacy-first, enterprise-grade vector barcode and QR code generation suite. Designed for businesses, logistics, and developers who demand zero external telemetry, crisp print-ready vector graphics, deterministic scannability verification, and full bilingual (English & Arabic) accessibility.

---

## 🚀 Live Demo & Production Deployment

- **Live Web App**: [https://seotarek.github.io/omnicode-studio/](https://seotarek.github.io/omnicode-studio/)
- **Zero Backend Required**: Runs 100% in your browser. No server tracking, no database, no external API calls.

---

## ✨ Key Architectural Features

### 1. 🔲 Advanced QR Code Customizer
- **Dot Topologies**: `square`, `rounded`, `dots`, `classy`, `classy-rounded`, `extra-rounded`.
- **Corner Eye Geometries**: Independent styling for Outer Corner Square and Inner Corner Dot (`square`, `rounded`, `extra-rounded`, `dot`).
- **Gradient Engines**: Linear and Radial dual-color gradient transitions across modules.
- **Logo Integration & Protection Zone**: Embed custom SVG/PNG/JPEG logos with automatic quiet-zone clipping to prevent scanning errors.
- **Payload Presets**: Out-of-the-box standard formatters for **WiFi (WPA/WEP)**, **vCard 3.0**, **WhatsApp Direct**, **Email (mailto)**, **SMS**, **Phone (tel)**, **Geo Coordinates**, and **Calendar Events (iCal)**.

### 2. 📊 Enterprise 1D Barcode Engine
- **Symbologies Supported**:
  - `CODE128` (Auto A/B/C) - Logistics, shipping labels, inventory.
  - `EAN-13` & `EAN-8` - Global retail with strict checksum parity checks.
  - `UPC-A` - North American consumer products.
  - `CODE39` - Defense, automotive, and industrial inventory.
  - `ITF-14` - Master corrugated shipping cartons.
  - `Pharmacode` - Pharmaceutical packaging.
- **Dynamic Checksum & Format Validation**: Real-time feedback preventing invalid barcodes before export.

### 3. 🛡️ Deterministic Scannability & Contrast Health Meter
- Calculates **WCAG 2.2 Relative Luminance Contrast Ratio** between foreground and background.
- Emits real-time warnings if contrast falls below ISO 18004 scanning thresholds (< 4.5:1 recommended, < 2.5:1 critical).

### 4. 📦 Client-Side Batch Generator (ZIP Export)
- Import CSV or multi-line plain text.
- Generates batch vector SVGs directly in browser memory and downloads as a single bundled `.zip` archive via `JSZip`.

### 5. 🖨️ Multi-Format High-Resolution Export
- **Vector**: Clean, infinite-scale `.svg` strings.
- **Raster**: Ultra-high-resolution `.png` (1200x1200px print-density), `.webp`, `.jpeg`.
- **Print PDF**: Direct vector `.pdf` output with ISO print margins.
- **Clipboard**: Quick SVG copy for Figma, Illustrator, and Inkscape.

### 6. 🌐 Native Bilingual Architecture (LTR / RTL)
- Complete English and Arabic translations with full bidirectional layout support.

---

## 🏗️ Architecture & Decoupled Engine

```
omnicode-studio/
├── src/
│   ├── core/                  # Headless, zero-DOM core engine
│   │   ├── qr/                # Scalable dot & corner SVG algorithms
│   │   ├── barcode/           # Symbology validators & barcode generators
│   │   ├── payloads/          # Standardized payload builders (WiFi, vCard, etc.)
│   │   ├── validator/         # WCAG contrast & ISO scannability scoring
│   │   ├── export.ts          # SVG/Canvas/PDF/ZIP export pipelines
│   │   └── presets.ts         # High-end aesthetic templates
│   ├── i18n/                  # English & Arabic dictionaries
│   ├── App.tsx                # Studio GUI (React + Tailwind)
│   └── main.tsx               # Browser entrypoint
├── docs/
│   └── ENTERPRISE_INTEGRATION_ROADMAP.md # Laravel & WordPress integration blueprint
└── tests/unit/                # Vitest comprehensive unit test suite
```

---

## 🛠️ Local Development & Testing

```bash
# 1. Clone repository
git clone https://github.com/seotarek/omnicode-studio.git
cd omnicode-studio

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Start local development server
npm run dev

# 5. Build production bundle
npm run build
```

---

## 🗺️ Enterprise Roadmap (Laravel & WordPress)

For enterprise platform architects looking to integrate OmniCode into existing ERP, SaaS, or CMS stacks:
- 👉 Read the full [Enterprise Integration Roadmap](docs/ENTERPRISE_INTEGRATION_ROADMAP.md) detailing upcoming packages:
  - `omnicode/laravel-omnicode` (Blade directives, fluent facade, queueable batch PDF rendering)
  - `omnicode-wp` (Gutenberg block & automated WooCommerce fulfillment barcode injection)

---

## 🔒 Privacy & Security Guarantees

1. **No External Network Requests**: Code generation runs strictly client-side via JavaScript & SVG math.
2. **Confidentiality**: Customer credentials (WiFi passwords, contact details, internal URLs) never leave the client device.
3. **Auditability**: 100% open-source under the permissive MIT license.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
