<?php

declare(strict_types=1);

namespace Omnicode\Laravel;

use Illuminate\Support\Facades\Storage;
use Omnicode\Barcode\BarcodeGenerator;
use Omnicode\Builder\BarcodeBuilder;
use Omnicode\Builder\QrBuilder;
use Omnicode\Qr\QrCodeGenerator;
use Omnicode\OmniCode;
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
     * Generates a QR code SVG or returns a fluent QrBuilder initialized with config.
     */
    public function qr(?string $data = null, array $options = []): string|QrBuilder
    {
        $defaults = $this->config['qr'] ?? [];

        if ($data === null && empty($options)) {
            $builder = new QrBuilder();
            if (isset($defaults['size'])) $builder->size((int)$defaults['size']);
            if (isset($defaults['margin'])) $builder->margin((int)$defaults['margin']);
            if (isset($defaults['ec_level'])) $builder->errorCorrection($defaults['ec_level']);
            if (isset($defaults['dot_type'])) $builder->dots($defaults['dot_type']);
            if (isset($defaults['fg_color'])) $builder->color($defaults['fg_color']);
            if (isset($defaults['bg_color'])) $builder->backgroundColor($defaults['bg_color']);
            return $builder;
        }

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
     * Generates a Barcode SVG or returns a fluent BarcodeBuilder initialized with config.
     */
    public function barcode(?string $data = null, string $format = 'CODE128', array $options = []): string|BarcodeBuilder
    {
        $defaults = $this->config['barcode'] ?? [];

        if ($data === null && empty($options)) {
            $builder = new BarcodeBuilder();
            if (isset($defaults['style'])) $builder->style($defaults['style']);
            if (isset($defaults['width'])) $builder->width((int)$defaults['width']);
            if (isset($defaults['height'])) $builder->height((int)$defaults['height']);
            if (isset($defaults['line_color'])) $builder->color($defaults['line_color']);
            if (isset($defaults['background'])) $builder->backgroundColor($defaults['background']);
            return $builder;
        }

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
     * Batch processes an array of QR and Barcode items.
     */
    public function batch(array $items): array
    {
        return OmniCode::batch($items);
    }

    /**
     * Generates and stores a QR code SVG on the specified Laravel Storage disk.
     */
    public function storeQr(string $path, string $data, array $options = [], ?string $disk = null): string
    {
        $targetDisk = $disk ?? $this->config['disk'] ?? 'public';
        $svg = $this->qr($data, $options);
        Storage::disk($targetDisk)->put($path, (string)$svg);
        return $path;
    }

    /**
     * Generates and stores a Barcode SVG on the specified Laravel Storage disk.
     */
    public function storeBarcode(string $path, string $data, string $format = 'CODE128', array $options = [], ?string $disk = null): string
    {
        $targetDisk = $disk ?? $this->config['disk'] ?? 'public';
        $svg = $this->barcode($data, $format, $options);
        Storage::disk($targetDisk)->put($path, (string)$svg);
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

    public static function toBase64(string $svg): string
    {
        return base64_encode($svg);
    }

    public static function toDataUrl(string $svg, string $mimeType = 'image/svg+xml'): string
    {
        return 'data:' . $mimeType . ';base64,' . base64_encode($svg);
    }

    public static function getSupportedFormats(): array
    {
        return OmniCode::getSupportedFormats();
    }
}
