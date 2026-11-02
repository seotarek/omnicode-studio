# OmniCode Studio: Global Multi-Tier Code Generation Ecosystem

[![Deploy to GitHub Pages](https://github.com/seotarek/omnicode-studio/actions/workflows/deploy.yml/badge.svg)](https://github.com/seotarek/omnicode-studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-059669.svg)](https://opensource.org/licenses/MIT)
[![Tests: Vitest](https://img.shields.io/badge/TypeScript%20Tests-27%20Passing-0284c7.svg)](tests/)
[![Tests: PHPUnit](https://img.shields.io/badge/PHPUnit%20Tests-8%20Passing%20(24%20Assertions)-777bb4.svg)](packages/php/tests/)
[![Security: 0 Vulnerabilities](https://img.shields.io/badge/Security-0%20Vulnerabilities-059669.svg)](#security-and-privacy)

OmniCode is an enterprise-grade multi-tier ecosystem for generating, customizing, and verifying barcodes and QR codes. Engineered for headless execution across Node.js, PHP, Laravel, Docker microservices, and client-side web applications.

---

## Ecosystem Architecture

The OmniCode ecosystem is organized into three distinct tiers:

```
omnicode-studio/
├── packages/
│   ├── core/                  # Tier 1: @omnicode/core (Headless TypeScript engine)
│   ├── php/                   # Tier 2: omnicode/omnicode-php (PSR-4 / PSR-12 pure PHP library)
│   ├── laravel/               # Tier 2: omnicode/laravel-omnicode (Laravel ServiceProvider, Facade & Blade)
│   └── api/                   # Tier 3: @omnicode/api (Self-hosted REST API & Docker container)
├── src/                       # Web Studio interface (React 18, Vite & Tailwind CSS)
│   ├── components/            # Modular UI components (QR, Barcode, Batch, Preview, Layout)
│   ├── core/                  # Core vector generation pipelines
│   └── i18n/                  # Full English & Arabic bidirectional localization
├── tests/                     # Unit and ZXing independent round-trip decoding test suites
└── docs/                      # Architectural specifications & integration roadmaps
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

```bash
cd packages/core
npm install
npm run build
```

---

## Tier 2: PHP & Laravel SDKs

### 1. `omnicode/omnicode-php`
Pure PHP implementation for PHP 8.1+ conforming to PSR-4 and PSR-12. No ImageMagick or Ghostscript requirements.

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
Official Laravel package compatible with Laravel 10 and 11.

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

## Tier 3: Self-Hosted REST API (`@omnicode/api`)

Lightweight microservice providing language-agnostic HTTP endpoints for Python, Go, C#, Java, and Ruby integrations.

### Docker Deployment

```bash
cd packages/api
docker compose up -d --build
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & system version status |
| `GET` | `/api/v1/spec` | Full OpenAPI 3.0.3 JSON schema |
| `POST` | `/api/v1/qr/generate` | Generate styled vector QR code (JSON or SVG stream) |
| `POST` | `/api/v1/barcode/generate` | Generate industrial barcode with GS1 check digit verification |
| `POST` | `/api/v1/verify` | Check barcode check digit and QR optical contrast ratio |

```bash
# Generate QR code via cURL
curl -X POST http://localhost:8080/api/v1/qr/generate \
  -H "Content-Type: application/json" \
  -d '{"data": "https://omnicode.studio", "ecLevel": "H"}'
```

---

## Live Web Studio Application

- **Live URL**: [https://seotarek.github.io/omnicode-studio/](https://seotarek.github.io/omnicode-studio/)
- **Architecture**: 100% offline-first client-side computation. Runs entirely within the browser with zero external network tracking.
- **Bilingual Interface**: Seamless English and Arabic localization with full CSS logical property layout parity.

---

## Testing & Quality Assurance

The ecosystem enforces deterministic quality gates across all languages:

```bash
# Run root TypeScript unit and ZXing decoder tests (27 tests)
npm test

# Run PHPUnit test suite (8 tests, 24 assertions)
cd packages/php && ./vendor/bin/phpunit

# Run REST API integration test suite (7 tests)
cd packages/api && npm test

# Production build verification
npm run build
```

---

## Security and Privacy

- **Zero-Telemetry**: No user data, barcode payloads, or credentials are transmitted over external networks.
- **Strict Check Digit Enforcement**: Barcodes with invalid GS1 check digits are rejected at the validator layer prior to rendering.
- **XSS & Injection Protection**: All label text, header parameters, and logo URLs are sanitized against SVG/DOM injection vulnerabilities.
- **License**: MIT License. See [LICENSE](LICENSE) for details.
