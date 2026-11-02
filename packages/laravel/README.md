# omnicode/laravel-omnicode

Official Laravel Package for the **OmniCode Engine** (Laravel 10 and 11 compatible).

Provides ServiceProvider auto-discovery, the `OmniCode` Facade, Blade UI components, and asynchronous Queueable jobs with Storage disk integration.

## Installation

```bash
composer require omnicode/laravel-omnicode
```

Optionally publish the configuration:

```bash
php artisan vendor:publish --tag="omnicode-config"
```

## Usage

### 1. Blade Components

Render vector codes directly inside your Blade views with zero boilerplate:

```blade
{{-- Vector QR Code --}}
<x-omnicode-qr :data="$invoice->payment_url" :size="300" :ecc="'H'" :dotType="'rounded'" />

{{-- Industrial Shipping Label Barcode --}}
<x-omnicode-barcode 
    :data="$shipment->tracking_number" 
    format="CODE128" 
    style="thermal-label" 
    header="AIR LOGISTICS CARRIER" 
    footer="VERIFIED DISPATCH" 
/>
```

### 2. Using the Facade

```php
use Omnicode\Laravel\Facades\OmniCode;

// Generate raw SVG
$svg = OmniCode::qr('https://omnicode.studio', ['dotType' => 'dots']);

// Generate and store directly on S3 or local disk
OmniCode::storeQr('qrcodes/user_99.svg', 'https://example.com/profile', [], 's3');
OmniCode::storeBarcode('barcodes/sku_102.svg', '4006381333931', 'EAN13', ['style' => 'thermal-label']);
```

### 3. Background Generation with Queueable Jobs

Generate thousands of barcodes/QRs without blocking web requests:

```php
use Omnicode\Laravel\Jobs\GenerateCodeJob;

// Dispatch to your default Laravel queue (Redis, SQS, database)
GenerateCodeJob::dispatch('qr', 'qrcodes/large_batch_1.svg', 'https://omnicode.studio/item/1');
```

## License

MIT © OmniCode Studio Engineering Team
