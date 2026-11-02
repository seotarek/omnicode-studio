# omnicode/omnicode-php

Enterprise-grade, headless Barcode and QR Code generation engine for PHP 8.1+ (PSR-4 / PSR-12 compliant).

Pure PHP vector SVG generation with **zero heavy binary dependencies** (no ImageMagick or Ghostscript required).

## Features

- **Strict Standards**: Full PSR-4 autoloading and PSR-12 formatting.
- **GS1 Modulo 10 Check Digits**: Automatic validation and computation for EAN-13, EAN-8, UPC-A, and ITF-14.
- **Symbology Support**: CODE128, CODE39, EAN-13, EAN-8, UPC-A, ITF-14, and Pharmacode.
- **Industrial Styles**: Thermal warehouse shipment labels, retail price stickers, event badge frames, and clean minimal presets.
- **QR Code Engine**: Native Reed-Solomon ECC (L, M, Q, H), dot shapes (square, rounded, dots), color gradients, and logo protection.
- **Payload Builders**: WiFi (WPA/WEP), vCard 3.0, WhatsApp, Email, Phone, and Cryptocurrency payments.
- **Diagnostic Validation**: ISO/IEC contrast ratio calculations and scannability ratings.

## Installation

```bash
composer require omnicode/omnicode-php
```

## Usage

### 1. Generate Industrial Barcode SVG

```php
use Omnicode\OmniCode;

// Generate thermal warehouse label
$svg = OmniCode::barcode('LOGISTICS-9942', 'CODE128', [
    'style' => 'thermal-label',
    'headerText' => 'WAREHOUSE AIR SHIPMENT',
    'footerText' => 'CARRIER VERIFIED'
]);

echo $svg;
```

### 2. Generate QR Code SVG

```php
use Omnicode\OmniCode;

$svg = OmniCode::qr('https://omnicode.studio', [
    'ecLevel' => 'H',
    'size' => 400,
    'dotType' => 'rounded',
    'fgColor' => '#059669',
    'bgColor' => '#ffffff'
]);

echo $svg;
```

### 3. Generate WiFi & vCard Payloads

```php
use Omnicode\Payload\PayloadBuilder;
use Omnicode\OmniCode;

$wifiPayload = PayloadBuilder::wifi('CorpNetwork', 'SecretPass2026', 'WPA');
$qrSvg = OmniCode::qr($wifiPayload, ['ecLevel' => 'M']);
```

### 4. Check Scannability & Contrast

```php
use Omnicode\Validator\ScannabilityValidator;

$diagnostics = ScannabilityValidator::validate('#059669', '#ffffff', 'H', false);
echo "Score: {$diagnostics['score']} / Contrast: {$diagnostics['contrastRatio']}:1";
```

## Running Tests

```bash
./vendor/bin/phpunit
```

## License

MIT © OmniCode Studio Engineering Team
