<?php

declare(strict_types=1);

namespace Omnicode\Laravel;

use Illuminate\Support\Facades\Storage;
use Omnicode\Barcode\BarcodeGenerator;
use Omnicode\Qr\QrCodeGenerator;
use Omnicode\Payload\PayloadBuilder;
use Omnicode\Validator\ScannabilityValidator;

class OmniCodeManager
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * Generates a QR code SVG string.
     */
    public function qr(string $data, array $options = []): string
    {
        $defaults = $this->config['qr'] ?? [];
        $merged = array_merge([
            'data' => $data,
            'size' => $defaults['size'] ?? 360,
            'margin' => $defaults['margin'] ?? 16,
            'ecLevel' => $defaults['ec_level'] ?? 'H',
            'dotType' => $defaults['dot_type'] ?? 'rounded',
            'fgColor' => $defaults['fg_color'] ?? '#000000',
            'bgColor' => $defaults['bg_color'] ?? '#ffffff'
        ], $options);

        return QrCodeGenerator::generateSvg($merged);
    }

    /**
     * Generates a Barcode SVG string.
     */
    public function barcode(string $data, string $format = 'CODE128', array $options = []): string
    {
        $defaults = $this->config['barcode'] ?? [];
        $merged = array_merge([
            'data' => $data,
            'format' => $format,
            'style' => $defaults['style'] ?? 'classic',
            'width' => $defaults['width'] ?? 2,
            'height' => $defaults['height'] ?? 90,
            'lineColor' => $defaults['line_color'] ?? '#000000',
            'background' => $defaults['background'] ?? '#ffffff'
        ], $options);

        return BarcodeGenerator::generateSvg($merged);
    }

    /**
     * Generates and stores a QR code SVG on the specified Laravel Storage disk.
     */
    public function storeQr(string $path, string $data, array $options = [], ?string $disk = null): string
    {
        $targetDisk = $disk ?? $this->config['disk'] ?? 'public';
        $svg = $this->qr($data, $options);
        Storage::disk($targetDisk)->put($path, $svg);
        return $path;
    }

    /**
     * Generates and stores a Barcode SVG on the specified Laravel Storage disk.
     */
    public function storeBarcode(string $path, string $data, string $format = 'CODE128', array $options = [], ?string $disk = null): string
    {
        $targetDisk = $disk ?? $this->config['disk'] ?? 'public';
        $svg = $this->barcode($data, $format, $options);
        Storage::disk($targetDisk)->put($path, $svg);
        return $path;
    }

    /**
     * Validates contrast and scannability.
     */
    public function validateScannability(string $fgColor, string $bgColor, array $options = []): array
    {
        return ScannabilityValidator::validate(
            $fgColor,
            $bgColor,
            $options['ecLevel'] ?? 'M',
            $options['hasLogo'] ?? false,
            $options['logoRatio'] ?? 0.2
        );
    }
}
