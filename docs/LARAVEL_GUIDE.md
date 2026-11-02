# OmniCode Laravel Integration Guide

## Installation
```bash
composer require omnicode/omnicode-laravel
```

The package automatically registers via Laravel Package Discovery:
- **Service Provider**: `Omnicode\Laravel\OmniCodeServiceProvider`
- **Facade**: `Omnicode\Laravel\Facades\OmniCode`
- **Config**: `config/omnicode.php`

## Publish Configuration
```bash
php artisan vendor:publish --tag=omnicode-config
```

## Usage Examples

### 1. Fluent Builder
```php
use Omnicode\Laravel\Facades\OmniCode;

// QR Code
$svg = OmniCode::qr()
    ->data('https://example.com/item/101')
    ->size(360)
    ->color('#059669')
    ->generate();

// Barcode
$barcode = OmniCode::barcode()
    ->format('EAN13')
    ->data('4006381333931')
    ->validate()
    ->style('thermal-label')
    ->header('INVENTORY')
    ->generate();
```

### 2. Blade Components
```blade
{{-- QR Code Component --}}
<x-omnicode-qr
    :data="$product->url"
    size="300"
    ecc="H"
    dotType="rounded"
    fgColor="#047857"
/>

{{-- Barcode Component --}}
<x-omnicode-barcode
    format="CODE128"
    :data="$order->tracking_number"
    header="TRACKING"
/>
```

### 3. Storage Integration
```php
// Store directly to public disk
OmniCode::storeQr('qrcodes/qr-101.svg', 'https://example.com/101', ['ecLevel' => 'H']);

// Store barcode to s3
OmniCode::storeBarcode('barcodes/sku.svg', '4006381333931', 'EAN13', [], 's3');
```

### 4. Queueable Background Jobs
```php
use Omnicode\Laravel\Jobs\GenerateCodeJob;
use Omnicode\Laravel\Jobs\GenerateCodeBatchJob;

// Single background job
dispatch(new GenerateCodeJob('qr', 'qrcodes/user-1.svg', 'https://user-profile.test'));

// Batch job
dispatch(new GenerateCodeBatchJob([
    ['id' => '1', 'type' => 'qr', 'path' => 'qrcodes/1.svg', 'data' => 'https://item1.test'],
    ['id' => '2', 'type' => 'barcode', 'path' => 'barcodes/2.svg', 'data' => '4006381333931', 'format' => 'EAN13']
], 'inventory', 'public'));
```
