# OmniCode Studio v1.1.0 — Enterprise Barcode & QR Ecosystem

OmniCode Studio is a production-ready, zero-telemetry barcode and QR code generation, validation, and encoding ecosystem. It delivers headless engines, fluent builders, batch queue processing, standard enterprise payload encoders, and containerized microservices across TypeScript, PHP, Laravel, and Docker.

---

## What's New in v1.1.0

### 1. Enterprise PostScript (EPS) Vector Exporter
- **Adobe PostScript Language Level 2/3 Compliant**: Pure vector EPS export for commercial prepress, packaging, industrial label printers (Zebra ZPL, Sato, TSC), and graphic design workflows (Adobe Illustrator, InDesign, CorelDraw).
- **Flexographic Bar Width Reduction (BWR)**: Sub-point compensation parameter to counteract substrate ink spread and dot gain during high-speed flexo printing.
- **Available Everywhere**:
  - Web Studio: One-click "EPS Vector" export button in the live preview panel.
  - TypeScript / Node.js: `OmniCode.toEps(svg, options)` and `svgToEps(svg, options)`.
  - Pure PHP: `OmniCode::toEps($svg)` and `EpsExporter::fromSvg($svg)`.
  - REST API: `POST /api/v1/export` with `"outputFormat": "eps"` and `application/postscript` mime streaming.

### 2. Standard Enterprise Payloads
- **GS1 Digital Link 2.0 (Sunrise 2027)**: Standard URI path encoding (`/01/{gtin14}/10/{lot}/21/{serial}`) with ISO expiry dates (`?17=YYMMDD`) ensuring compliance with global retail transitions from 1D to 2D barcodes.
- **EPC SEPA QR Code (EPC069-12)**: Banking standard BCD credit transfer format for European instant bank transfers.
- **Saudi Arabia ZATCA E-Invoicing (Fatoora)**: Binary Tag-Length-Value (TLV) Base64 encoding supporting Phase 1 mandatory tags (1-5) and Phase 2 cryptographic audit tags (6-9) with full bidirectional encoder/decoder.

### 3. Unified Headless Engine & Fluent Builders
- **TypeScript Core (`@seotarek/omnicode-core`)**: Unified `OmniCode` facade with plugin lifecycle hooks (`onBeforeGenerate`, `onAfterGenerate`), batch processing, and Base64/DataURL helpers.
- **Pure PHP (`omnicode/omnicode-php`)**: Pure PHP 8.2 - 8.5+ implementation with Reed-Solomon GF(256) arithmetic, ISO/IEC 18004 penalty scoring, and fluent builders (`OmniCode::qr()->data(...)->toEps()`).
- **Laravel Integration (`omnicode/omnicode-laravel`)**: Async batch generation job (`GenerateCodeBatchJob`), configuration publishing, and storage integration.

### 4. GitHub Packages Distribution
- **Container Registry (GHCR)**: Pre-built, multi-stage Alpine Docker image available at:
  - `docker pull ghcr.io/seotarek/omnicode-api:latest`
  - `docker pull ghcr.io/seotarek/omnicode-api:v1.1.0`
- **NPM Package Registry**: Headless core available at:
  - `npm install @seotarek/omnicode-core` (configured for GitHub Packages `npm.pkg.github.com`)

### 5. Multi-Language SDK Clients
Production examples and client code for 7 platforms in `examples/`:
- `examples/curl/generate-codes.sh`
- `examples/nodejs/client.js`
- `examples/python/client.py`
- `examples/php-pure/demo.php`
- `examples/go/client.go`
- `examples/csharp/Program.cs`
- `examples/java/OmniCodeClient.java`

---

## Release Assets & Distribution Bundles

| Asset | Format | Description |
| :--- | :--- | :--- |
| `omnicode-studio-web-v1.1.0.zip` | ZIP | Static production build of OmniCode Web Studio (ready for Apache, Nginx, or Caddy) |
| `omnicode-core-v1.1.0.tgz` | TGZ | NPM package tarball for `@seotarek/omnicode-core` |
| `omnicode-php-v1.1.0.zip` | ZIP | Pure PHP SDK source package with PSR-4 autoloading |
| `omnicode-laravel-v1.1.0.zip` | ZIP | Laravel package with Service Provider, Facades, and Queue Jobs |
| `checksums-v1.1.0.txt` | TXT | SHA-256 cryptographic verification checksums for all release archives |

---

## Verification & Test Results
- **Core Engine & Studio (Vitest)**: 42 tests passed (100%)
- **REST API Integration (Vitest & Supertest)**: 32 tests passed (100%)
- **Pure PHP Engine (PHPUnit 11)**: 43 tests, 535 assertions passed (100%)
- **Laravel Integration (PHPUnit 11)**: 11 tests, 45 assertions passed (100%)
- **Docker E2E Container Smoke Suite**: 8/8 health, metrics, barcode, QR, and batch checks passed.
