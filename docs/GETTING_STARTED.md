# OmniCode Studio - Getting Started

OmniCode Studio is a universal code generation ecosystem providing independent SDKs, a self-hosted REST API, and a modern Web Studio.

## Architecture Overview

```
                      ┌───────────────────────────────────────┐
                      │            OmniCode Studio            │
                      │        (Global Code Ecosystem)        │
                      └──────────────────┬────────────────────┘
                                         │
         ┌───────────────────┬───────────┴───────────┬───────────────────┐
         ▼                   ▼                       ▼                   ▼
┌─────────────────┐ ┌─────────────────┐     ┌─────────────────┐ ┌─────────────────┐
│ @omnicode/core  │ │  omnicode-php   │     │ omnicode-laravel│ │ @omnicode/api   │
│  (Headless TS)  │ │ (Pure Composer) │     │ (Laravel + Blade│ │  (Docker REST)  │
└─────────────────┘ └─────────────────┘     └─────────────────┘ └─────────────────┘
```

## Quick Start by Platform

### 1. PHP & Composer
```bash
composer require omnicode/omnicode-php
```
```php
use Omnicode\OmniCode;

// Fluent QR
$qrSvg = OmniCode::qr()
    ->data('https://mycompany.com')
    ->errorCorrection('H')
    ->dots('rounded')
    ->color('#0D7377')
    ->generate();

// Fluent Barcode
$barcodeSvg = OmniCode::barcode()
    ->format('EAN13')
    ->data('4006381333931')
    ->validate()
    ->generate();
```

### 2. Laravel 10 / 11 / 12
```bash
composer require omnicode/omnicode-laravel
```
```blade
{{-- Blade Components --}}
<x-omnicode-qr :data="$productUrl" size="280" ecc="H" />
<x-omnicode-barcode format="EAN13" :data="$sku" />
```

### 3. JavaScript / TypeScript & Node.js
```bash
npm install @omnicode/core
```
```typescript
import { OmniCode } from "@omnicode/core";

const qr = OmniCode.generateQr({
  data: "https://mycompany.com",
  errorCorrectionLevel: "H"
});

const barcode = OmniCode.generateBarcode({
  format: "CODE128",
  data: "SHIP-1049"
});
```

### 4. REST API (Any Language via HTTP)
Run container:
```bash
docker run -p 8080:8080 omnicode-api
```
Generate QR:
```bash
curl -X POST http://localhost:8080/api/v1/generate/qr \
  -H "Content-Type: application/json" \
  -d '{"data": "https://example.com", "ecLevel": "H"}'
```
