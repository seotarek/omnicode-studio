# OmniCode Studio v1.2.0 — Enterprise Barcode & QR Ecosystem

OmniCode Studio is a production-ready, zero-telemetry barcode and QR code generation, validation, and encoding ecosystem. It delivers headless engines, fluent builders, optical decoders, standard enterprise payload encoders/decoders, and containerized microservices across TypeScript, PHP, Laravel, and Docker.

---

## What's New in v1.2.0

### 1. Optical Scanner & Verifier (Client-Side & Offline)
- **Instant Optical Decoding**: Decode QR Codes, Data Matrix, Aztec, PDF417, EAN-13, UPC-A, Code 128, Code 39, and Codabar directly in the browser using WebAssembly / Canvas.
- **Clipboard & File Drop Support**: Drag and drop images or paste directly from clipboard (`Ctrl+V`) without saving temporary files.
- **Standards Auto-Classification**: Automatically detects and parses structured payloads:
  - GS1 Digital Link 2027 (GTIN, Lot, Serial, Expiry)
  - Saudi Arabia ZATCA E-Invoicing Phase 1 & 2 TLV tags
  - SEPA Credit Transfer (EPC069-12)
  - WiFi credentials (SSID, WPA/WEP key, hidden state)
  - vCard 3.0 / 4.0 contact cards
- **Studio Transfer Actions**: One-click "Open in QR Studio" and "Open in Barcode Studio" to immediately clone, restyle, and re-export scanned codes.

### 2. Bidirectional Enterprise Decoders (TypeScript Core & Pure PHP)
- **Full Symmetric Architecture**:
  - TypeScript: `decodeGs1DigitalLink`, `decodeEpcSepa`, `decodeWifi`, `decodeVCard`, `decodeZatcaInvoice` exported from `@seotarek/omnicode-core`.
  - Pure PHP: `PayloadBuilder::decodeGs1DigitalLink()`, `PayloadBuilder::decodeEpcSepa()`, `PayloadBuilder::decodeWifi()`, `PayloadBuilder::decodeVCard()`, `PayloadBuilder::decodeZatcaInvoice()`.
- **REST API Decoder Endpoint**: `POST /api/v1/payloads/decode` now accepts `type`: `"zatca"`, `"gs1"`, `"epc"`, `"wifi"`, `"vcard"`.

### 3. Barcode Check-Digit Auto-Repair Assistant
- Real-time Modulo 10 check digit verification for EAN-13, EAN-8, UPC-A, and ITF-14 symbologies.
- One-click "Auto-Fix Check Digit" assistant in the UI to prevent unreadable barcodes on retail POS scanners.

### 4. Enterprise PostScript (EPS) Vector Exporter
- **Adobe PostScript Language Level 2/3 Compliant**: Pure vector EPS export for commercial prepress, packaging, and industrial label printers (Zebra ZPL, Sato, TSC).
- **Flexographic Bar Width Reduction (BWR)**: Sub-point compensation parameter to counteract substrate ink spread during flexo printing.
- Supported across Web Studio, TypeScript Core, Pure PHP, and REST API (`POST /api/v1/export` with `"outputFormat": "eps"`).

### 5. GitHub Packages Distribution
- **Container Registry (GHCR)**:
  - `docker pull ghcr.io/seotarek/omnicode-api:latest`
  - `docker pull ghcr.io/seotarek/omnicode-api:v1.2.0`
- **NPM Package Registry**:
  - `npm install @seotarek/omnicode-core@1.2.0` (published to `npm.pkg.github.com`)

---

## Release Assets & Distribution Bundles

| Asset | Format | Description |
| :--- | :--- | :--- |
| `omnicode-studio-web-v1.2.0.zip` | ZIP | Static production build of OmniCode Web Studio (ready for Apache, Nginx, or Caddy) |
| `omnicode-core-v1.2.0.tgz` | TGZ | NPM package tarball for `@seotarek/omnicode-core` |
| `omnicode-php-v1.2.0.zip` | ZIP | Pure PHP SDK source package with PSR-4 autoloading |
| `omnicode-laravel-v1.2.0.zip` | ZIP | Laravel package with Service Provider, Facades, and Queue Jobs |
| `checksums-v1.2.0.txt` | TXT | SHA-256 cryptographic verification checksums for all release archives |

---

## Verification & Test Results
- **Core Engine & Studio (Vitest)**: 47 tests passed (100%)
- **REST API Service (Supertest / Vitest)**: 32 tests passed (100%)
- **Pure PHP Engine (PHPUnit 11)**: 47 tests, 556 assertions passed (100%)
- **Laravel Framework Integration (PHPUnit 11)**: 11 tests, 45 assertions passed (100%)
- **Zero Failed Tests Across All 4 Tiers**
