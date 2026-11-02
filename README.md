# OmniCode Studio: Global Multi-Tier Code Generation Ecosystem

[![Latest Release](https://img.shields.io/badge/Release-v1.1.0-059669.svg)](https://github.com/seotarek/omnicode-studio/releases)
[![GitHub Packages](https://img.shields.io/badge/GitHub%20Packages-GHCR%20%2B%20NPM-2563eb.svg)](https://github.com/users/seotarek/packages?repo_name=omnicode-studio)
[![CI & CD Pipeline](https://github.com/seotarek/omnicode-studio/actions/workflows/deploy.yml/badge.svg)](https://github.com/seotarek/omnicode-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-059669.svg)](https://opensource.org/licenses/MIT)
[![Core Tests](https://img.shields.io/badge/Core%20Tests-42%20Passing-0284c7.svg)](tests/)
[![API Tests](https://img.shields.io/badge/API%20Tests-32%20Passing-10b981.svg)](packages/api/tests/)
[![PHP Tests](https://img.shields.io/badge/PHP%20Tests-43%20Passing%20(535%20Assertions)-777bb4.svg)](packages/php/tests/)
[![Laravel Tests](https://img.shields.io/badge/Laravel%20Tests-11%20Passing%20(45%20Assertions)-ff2d20.svg)](packages/laravel/tests/)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened%20(OWASP%20%2B%20SSRF%20%2B%20Auth)-059669.svg)](#security-and-privacy)

OmniCode is an enterprise-grade multi-tier ecosystem for generating, customizing, and verifying barcodes and QR codes. Engineered for headless execution across Node.js, PHP, Laravel, Docker microservices, and client-side web applications with an executive, unified light interface.

---

## Ecosystem Architecture

The OmniCode ecosystem is organized into four distinct tiers:

```
omnicode-studio/
├── packages/
│   ├── core/                  # Tier 1: @omnicode/core (Headless TypeScript engine & Plugin Architecture)
│   ├── php/                   # Tier 2: omnicode/omnicode-php (PSR-4 / PSR-12 pure PHP ISO/IEC 18004 QR & barcode)
│   ├── laravel/               # Tier 2: omnicode/omnicode-laravel (Laravel ServiceProvider, Facade & Blade)
│   └── api/                   # Tier 3: @omnicode/api (Hardened REST API & Docker microservice)
├── src/                       # Tier 4: Web Studio interface (React 18, Vite & Tailwind CSS)
├── docs/                      # Architectural Decision Records (ADRs) & Integration Guides
├── examples/                  # Multi-language client integrations (Python, Go, C#, Java, Node.js, PHP, cURL)
├── tests/                     # Unit, security, and ZXing independent round-trip decoding test suites
└── .github/workflows/         # Multi-job CI/CD (Node 22, PHP 8.2/8.3 matrix, Docker smoke, Pages)
```

---

## Tier 1: OmniCode Core Engine (`@omnicode/core`)

Headless, environment-agnostic TypeScript generation engine. Runs in Node.js, Browsers, Bun, Deno, and Edge functions.

- **Zero Heavy Binary Dependencies**: Generates vector SVG and raw boolean matrices directly in memory.
- **GS1 Modulo 10 Check Digits**: Automatic validation and computation for EAN-13, EAN-8, UPC-A, and ITF-14.
- **Symbologies Supported**: CODE128, CODE39, EAN-13, EAN-8, UPC-A, ITF-14, MSI Plessey, Codabar (NW-7), and Pharmacode.
- **Topologies**: Square, Rounded, Dots, Classy, Extra-Rounded, Diamond, Star, Horizontal & Vertical Bars.
- **Payload Encoders**: WiFi (WPA/WEP), vCard 3.0, WhatsApp, Email, Phone, SMS, Geo, and Cryptocurrency.
- **Optical Scannability**: ISO/IEC contrast calculations and hardware scannability diagnostics.
- **Plugin Architecture**: Register lifecycle hooks (`onBeforeGenerate`, `onAfterGenerate`) for telemetry or custom styling.
- **Batch Processing**: In-memory chunked processing for mixed QR and barcode queues.

```bash
npm install @omnicode/core
```

```typescript
import { OmniCode } from "@omnicode/core";

// Generate QR Code
const qr = OmniCode.generateQr({
  data: "https://omnicode.studio",
  errorCorrectionLevel: "H"
});

// Generate Barcode
const barcode = OmniCode.generateBarcode({
  format: "EAN13",
  data: "4006381333931"
});

// Batch Processing
const results = OmniCode.batch([
  { id: 1, type: "qr", options: { data: "https://item1.test" } },
  { id: 2, type: "barcode", options: { format: "CODE128", data: "PRODUCT-99" } }
]);
```

---

## Tier 2: PHP & Laravel SDKs

### 1. `omnicode/omnicode-php`
Pure PHP implementation for PHP 8.1+ conforming to PSR-4 and PSR-12. Zero ImageMagick or Ghostscript requirements.
Includes a native, ISO/IEC 18004 compliant QR generator with Galois Field $GF(2^8)$ (primitive polynomial 285) Reed-Solomon algebraic decoding and error recovery.

```bash
composer require omnicode/omnicode-php
```

```php
use Omnicode\OmniCode;

// Fluent QR Builder
$qrSvg = OmniCode::qr()
    ->data('https://omnicode.studio')
    ->errorCorrection('H')
    ->dots('rounded')
    ->color('#0D7377')
    ->generate();

// Fluent Barcode Builder
$barcodeSvg = OmniCode::barcode()
    ->format('EAN13')
    ->data('4006381333931')
    ->validate()
    ->style('thermal-label')
    ->header('WAREHOUSE 4B')
    ->generate();

// Batch Processing
$batch = OmniCode::batch([
    ['id' => 'item-1', 'type' => 'qr', 'options' => ['data' => 'https://example.com/1']],
    ['id' => 'item-2', 'type' => 'barcode', 'options' => ['data' => '4006381333931', 'format' => 'EAN13']]
]);
```

### 2. `omnicode/omnicode-laravel`
Official Packagist-ready Laravel package compatible with Laravel 10, 11, and 12.

- **Auto-Discovery**: Automatic ServiceProvider and Facade registration.
- **Blade Components**: `<x-omnicode-qr :data="$url" />` and `<x-omnicode-barcode :data="$sku" format="EAN13" />`.
- **Storage Disks**: Store generated SVGs directly to S3 or local disks with `OmniCode::storeQr(...)`.
- **Asynchronous Queues**: Queueable `GenerateCodeJob` and `GenerateCodeBatchJob` for background batch generation.

```blade
<x-omnicode-qr :data="$invoice->payment_url" :size="300" ecc="H" dotType="rounded" />

<x-omnicode-barcode 
    :data="$shipment->tracking_number" 
    format="CODE128" 
    style="thermal-label" 
    header="AIR LOGISTICS" 
/>
```

---

## Tier 3: Hardened REST API (`@omnicode/api`)

Production-ready microservice providing language-agnostic HTTP endpoints for Python, Go, C#, Java, and cURL integrations.

### Security & Hardening Features
- **Configurable CORS**: Customizable allowed origins via `CORS_ORIGIN`.
- **Sliding-Window Rate Limiting**: 100 requests per 15 minutes per IP with `Retry-After` headers.
- **API Key Authentication**: Optional API key enforcement via `x-api-key` or `Authorization: Bearer <key>`.
- **SSRF Defense**: Strict validation of `logoUrl` blocking private IPv4 ranges, AWS/GCP metadata endpoints (169.254.169.254), and localhost.
- **Input Bounds Checking**: Maximum payload length 4096 characters, dimensions strictly clamped.
- **Live Metrics**: `/metrics` returning uptime, process memory (RSS, Heap), and PID.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & system version status with OWASP headers |
| `GET` | `/metrics` | Telemetry, uptime, and memory usage |
| `GET` | `/api/v1/spec` | Full OpenAPI 3.0.3 JSON schema |
| `GET` | `/api/v1/symbologies` | Detailed reference of all supported 1D & 2D symbologies |
| `POST` | `/api/v1/generate/qr` | Generate styled vector QR code (JSON or SVG stream) |
| `POST` | `/api/v1/generate/barcode` | Generate industrial barcode with check digit validation |
| `POST` | `/api/v1/generate/batch` | Process up to 100 codes in a single batch |
| `POST` | `/api/v1/validate` | Check barcode check digit and optical contrast ratio |
| `POST` | `/api/v1/export` | Export directly as SVG, Base64, or Data URL |

---

## Tier 4: Live Web Studio Application

- **Live URL**: [https://seotarek.github.io/omnicode-studio/](https://seotarek.github.io/omnicode-studio/)
- **Unified Executive Light Theme**: Pristine light styling with zero dark mode pollution, warm slate cards, and emerald accents.
- **Architecture**: 100% offline-first client-side computation. Runs entirely within the browser with zero external network tracking.
- **Bilingual Interface**: Seamless English and Arabic localization with full CSS logical property layout parity.
- **Optimized Bundle Splitting**: All vendor libraries (`jspdf`, `jszip`, `html2canvas`, `dompurify`, `jsbarcode`, `react`) code-split cleanly under 500kB.

---

## Documentation & Client Examples

- [Getting Started Guide](docs/GETTING_STARTED.md)
- [Laravel Integration Guide](docs/LARAVEL_GUIDE.md)
- [Pure PHP Integration Guide](docs/PHP_GUIDE.md)
- [REST API Microservice Guide](docs/REST_API_GUIDE.md)
- [Architecture Decision Records (ADRs)](docs/adr/)
- Multi-Language Examples:
  - [cURL Script](examples/curl/generate-codes.sh)
  - [Python Client](examples/python/client.py)
  - [Node.js Client](examples/nodejs/client.js)
  - [Pure PHP Demo](examples/php-pure/demo.php)
  - [Go Client](examples/go/client.go)
  - [.NET / C# Client](examples/csharp/Program.cs)
  - [Java Client](examples/java/OmniCodeClient.java)

---

## Testing & Quality Assurance

The ecosystem enforces deterministic quality gates across all packages:

```bash
# Run root TypeScript unit, security, and ZXing decoder tests (34 tests)
npm test

# Run REST API integration test suite (31 tests)
cd packages/api && npm test

# Run Pure PHP package tests (35 tests, 495 assertions)
cd packages/php && ./vendor/bin/phpunit

# Run Laravel package integration tests (11 tests, 45 assertions)
cd packages/laravel && ./vendor/bin/phpunit

# Production build verification (0 warnings, code-split chunks)
npm run build
```

---

## Security and Privacy

- **Zero-Telemetry**: No user data, barcode payloads, or credentials are transmitted over external networks.
- **Strict Check Digit Enforcement**: Barcodes with invalid GS1 check digits are rejected at the validator layer prior to rendering.
- **XSS & Injection Protection**: All label text, header parameters, and logo URLs are sanitized against SVG/DOM injection vulnerabilities.
- **License**: MIT License. See [LICENSE](LICENSE) for details.
