# OmniCode Studio: Global Multi-Tier Code Generation Ecosystem

[![CI & CD Pipeline](https://github.com/seotarek/omnicode-studio/actions/workflows/deploy.yml/badge.svg)](https://github.com/seotarek/omnicode-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-059669.svg)](https://opensource.org/licenses/MIT)
[![Core & Studio Tests](https://img.shields.io/badge/Core%20Tests-26%20Passing-0284c7.svg)](tests/)
[![API Tests](https://img.shields.io/badge/API%20Tests-22%20Passing-10b981.svg)](packages/api/tests/)
[![PHPUnit Tests](https://img.shields.io/badge/PHPUnit%20Tests-18%20Passing%20(93%20Assertions)-777bb4.svg)](packages/php/tests/)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened%20(SSRF%20%2B%20XSS%20%2B%20Auth)-059669.svg)](#security-and-privacy)

OmniCode is an enterprise-grade multi-tier ecosystem for generating, customizing, and verifying barcodes and QR codes. Engineered for headless execution across Node.js, PHP, Laravel, Docker microservices, and client-side web applications with an executive, unified light interface.

---

## Ecosystem Architecture

The OmniCode ecosystem is organized into four distinct tiers:

```
omnicode-studio/
├── packages/
│   ├── core/                  # Tier 1: @omnicode/core (Headless TypeScript engine)
│   ├── php/                   # Tier 2: omnicode/omnicode-php (PSR-4 / PSR-12 pure PHP ISO/IEC 18004 QR & barcode)
│   ├── laravel/               # Tier 2: omnicode/laravel-omnicode (Laravel ServiceProvider, Facade & Blade)
│   └── api/                   # Tier 3: @omnicode/api (Hardened REST API & Docker microservice)
├── src/                       # Tier 4: Web Studio interface (React 18, Vite & Tailwind CSS)
│   ├── components/            # Modular UI components (QR, Barcode, Batch, Preview, Layout)
│   ├── core/                  # Core vector generation pipelines & security sanitizers
│   └── i18n/                  # Full English & Arabic bidirectional localization
├── tests/                     # Unit, security, and ZXing independent round-trip decoding test suites
└── .github/workflows/         # Multi-job CI/CD (Node 22, PHP 8.2/8.3 matrix, Docker smoke, Pages)
```

---

## Tier 1: OmniCode Core Engine (`@omnicode/core`)

Headless, environment-agnostic TypeScript generation engine. Runs in Node.js, Browsers, Bun, Deno, and Edge functions.

- **Zero Heavy Binary Dependencies**: Generates vector SVG and raw boolean matrices directly in memory.
- **GS1 Modulo 10 Check Digits**: Automatic validation and computation for EAN-13, EAN-8, UPC-A, and ITF-14.
- **Symbologies Supported**: CODE128, CODE39, EAN-13, EAN-8, UPC-A, ITF-14, and Pharmacode.
- **Topologies**: Square, Rounded, Dots, Classy, Extra-Rounded, Diamond, Star, Horizontal & Vertical Bars.
- **Payload Encoders**: WiFi (WPA/WEP), vCard 3.0, WhatsApp, Email, Phone, SMS, Geo, and Cryptocurrency.
- **Optical Scannability**: ISO/IEC contrast calculations and hardware scannability diagnostics.
- **Security & XSS Defense**: Strict CSS color validation (`isValidColor`, `sanitizeColor`) and DOMPurify SVG sanitization.

```bash
cd packages/core
npm install
npm run build
```

---

## Tier 2: PHP & Laravel SDKs

### 1. `omnicode/omnicode-php`
Pure PHP implementation for PHP 8.1+ conforming to PSR-4 and PSR-12. Zero ImageMagick or Ghostscript requirements.
Includes a native, ISO/IEC 18004 compliant QR generator with GF(256) Galois Field mathematics, Reed-Solomon block interleaving, optimal mask evaluation, and Format Information BCH (15,5).

```bash
composer require omnicode/omnicode-php
```

```php
use Omnicode\OmniCode;

// Generate thermal warehouse label
$svg = OmniCode::barcode('LOGISTICS-9942', 'CODE128', [
    'style' => 'thermal-label',
    'headerText' => 'WAREHOUSE AIR SHIPMENT',
    'footerText' => 'CARRIER VERIFIED'
]);

// Generate vector QR code
$qrSvg = OmniCode::qr('https://omnicode.studio', ['ecLevel' => 'H', 'dotType' => 'rounded']);
```

### 2. `omnicode/laravel-omnicode`
Official Laravel package compatible with Laravel 10 and 11. Declares `"omnicode/omnicode-php": "*"` dependency.

- **Auto-Discovery**: Automatic ServiceProvider and Facade registration.
- **Blade Components**: `<x-omnicode-qr :data="$url" />` and `<x-omnicode-barcode :data="$sku" format="EAN13" />`.
- **Storage Disks**: Store generated SVGs directly to S3 or local disks with `OmniCode::storeQr(...)`.
- **Asynchronous Queues**: Queueable `GenerateCodeJob` for high-throughput batch generation.

```blade
<x-omnicode-qr :data="$invoice->payment_url" :size="300" :ecc="'H'" :dotType="'rounded'" />

<x-omnicode-barcode 
    :data="$shipment->tracking_number" 
    format="CODE128" 
    style="thermal-label" 
    header="AIR LOGISTICS" 
    footer="CARRIER APPROVED" 
/>
```

---

## Tier 3: Hardened REST API (`@omnicode/api`)

Production-ready microservice providing language-agnostic HTTP endpoints for Python, Go, C#, Java, and Ruby integrations.

### Security & Hardening Features
- **Configurable CORS**: Customizable allowed origins via `CORS_ORIGIN`.
- **In-Memory Rate Limiting**: 100 requests per 15 minutes per IP with `Retry-After` and `X-RateLimit-*` headers (bypassed for `/health` and `/api/v1/spec`).
- **Optional API Key Authentication**: Enforced via `x-api-key` or `Authorization: Bearer <key>` when `API_KEY` environment variable is defined.
- **SSRF Defense**: Strict validation of `logoUrl` blocking private IPv4 ranges (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 link-local/cloud metadata), IPv6 loopback/link-local, decimal/hex IPs, and internal domains (`localhost`, `metadata.google.internal`).
- **Input Bounds Checking**: Maximum payload length 4096 characters, dimensions strictly clamped.
- **Uniform Error Handling**: Production errors return clean JSON without leaking stack traces.

### Docker Deployment

```bash
cd packages/api
docker compose up -d --build
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health check & system version status |
| `GET` | `/api/v1/spec` | Public | Full OpenAPI 3.0.3 JSON schema |
| `POST` | `/api/v1/qr/generate` | Protected | Generate styled vector QR code (JSON or SVG stream) |
| `POST` | `/api/v1/barcode/generate` | Protected | Generate industrial barcode with GS1 check digit verification |
| `POST` | `/api/v1/verify` | Protected | Check barcode check digit and QR optical contrast ratio |

```bash
# Generate QR code via cURL
curl -X POST http://localhost:8080/api/v1/qr/generate \
  -H "Content-Type: application/json" \
  -d '{"data": "https://omnicode.studio", "ecLevel": "H"}'
```

---

## Tier 4: Live Web Studio Application

- **Live URL**: [https://seotarek.github.io/omnicode-studio/](https://seotarek.github.io/omnicode-studio/)
- **Unified Executive Light Theme**: Pristine light styling with zero dark mode pollution, warm slate cards, and emerald accents.
- **Architecture**: 100% offline-first client-side computation. Runs entirely within the browser with zero external network tracking.
- **Bilingual Interface**: Seamless English and Arabic localization with full CSS logical property layout parity.
- **Optimized Bundle Splitting**: All vendor libraries (`jspdf`, `jszip`, `html2canvas`, `dompurify`, `jsbarcode`, `react`) code-split under 500kB.

---

## Testing & Quality Assurance

The ecosystem enforces deterministic quality gates across all languages:

```bash
# Run root TypeScript unit, security, and ZXing decoder tests (26 tests)
npm test

# Run REST API integration test suite (22 tests)
cd packages/api && npm test

# Run Pure PHP package tests (11 tests, 63 assertions)
cd packages/php && ./vendor/bin/phpunit

# Run Laravel package integration tests (7 tests, 30 assertions)
cd packages/laravel && ../php/vendor/bin/phpunit

# Production build verification (0 warnings, code-split chunks)
npm run build
```

---

## Security and Privacy

- **Zero-Telemetry**: No user data, barcode payloads, or credentials are transmitted over external networks.
- **Strict Check Digit Enforcement**: Barcodes with invalid GS1 check digits are rejected at the validator layer prior to rendering.
- **XSS & Injection Protection**: All label text, header parameters, and logo URLs are sanitized against SVG/DOM injection vulnerabilities.
- **License**: MIT License. See [LICENSE](LICENSE) for details.
