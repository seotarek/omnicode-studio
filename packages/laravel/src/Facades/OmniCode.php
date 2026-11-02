<?php

declare(strict_types=1);

namespace Omnicode\Laravel\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static string qr(string $data, array $options = [])
 * @method static string barcode(string $data, string $format = 'CODE128', array $options = [])
 * @method static string storeQr(string $path, string $data, array $options = [], ?string $disk = null)
 * @method static string storeBarcode(string $path, string $data, string $format = 'CODE128', array $options = [], ?string $disk = null)
 * @method static array validateScannability(string $fgColor, string $bgColor, array $options = [])
 *
 * @see \Omnicode\Laravel\OmniCodeManager
 */
class OmniCode extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'omnicode';
    }
}
