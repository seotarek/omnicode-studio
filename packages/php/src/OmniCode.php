<?php

declare(strict_types=1);

namespace Omnicode;

use Omnicode\Barcode\BarcodeGenerator;
use Omnicode\Builder\BarcodeBuilder;
use Omnicode\Builder\QrBuilder;
use Omnicode\Qr\QrCodeGenerator;
use Omnicode\Payload\PayloadBuilder;
use Omnicode\Validator\ScannabilityValidator;

/**
 * OmniCode Global Code Generation Engine.
 */
class OmniCode
{
    /**
     * Fluent QR builder or immediate SVG generator.
     */
    public static function qr(?string $data = null, array $options = []): string|QrBuilder
    {
        if ($data === null && empty($options) && func_num_args() === 0) {
            return new QrBuilder();
        }

        return QrCodeGenerator::generateSvg(array_merge([
            'data' => $data ?? 'https://omnicode.studio'
        ], $options));
    }

    /**
     * Fluent Barcode builder or immediate SVG generator.
     */
    public static function barcode(?string $data = null, string $format = 'CODE128', array $options = []): string|BarcodeBuilder
    {
        if ($data === null && empty($options) && func_num_args() === 0) {
            return new BarcodeBuilder();
        }

        return BarcodeGenerator::generateSvg(array_merge([
            'data' => $data ?? '12345678',
            'format' => $format
        ], $options));
    }

    public static function payload(): string
    {
        return PayloadBuilder::class;
    }

    public static function validate(string $fgColor, string $bgColor, array $options = []): array
    {
        return ScannabilityValidator::validate(
            $fgColor,
            $bgColor,
            $options['ecLevel'] ?? 'M',
            $options['hasLogo'] ?? false,
            $options['logoRatio'] ?? 0.2
        );
    }

    public static function getSupportedFormats(): array
    {
        return [
            'barcodes' => [
                'CODE128',
                'EAN13',
                'EAN8',
                'UPC',
                'ITF14',
                'MSI',
                'pharmacode',
                'codabar'
            ],
            'qrErrorLevels' => ['L', 'M', 'Q', 'H'],
            'formats' => ['svg', 'base64', 'data-url']
        ];
    }

    /**
     * Batch processes an array of items.
     */
    public static function batch(array $items): array
    {
        $results = [];
        foreach ($items as $idx => $item) {
            $id = $item['id'] ?? $idx;
            $type = $item['type'] ?? 'qr';
            $options = $item['options'] ?? [];

            try {
                if ($type === 'qr') {
                    $svg = self::qr($options['data'] ?? 'https://omnicode.studio', $options);
                    $results[] = [
                        'id' => $id,
                        'type' => 'qr',
                        'success' => true,
                        'format' => 'svg',
                        'svg' => $svg
                    ];
                } elseif ($type === 'barcode') {
                    $format = $options['format'] ?? 'CODE128';
                    $data = $options['data'] ?? '';
                    BarcodeGenerator::validate($format, $data);
                    $svg = self::barcode($data, $format, $options);
                    $results[] = [
                        'id' => $id,
                        'type' => 'barcode',
                        'success' => true,
                        'format' => $format,
                        'svg' => $svg
                    ];
                } else {
                    $results[] = [
                        'id' => $id,
                        'type' => $type,
                        'success' => false,
                        'error' => "Unsupported item type: {$type}"
                    ];
                }
            } catch (\Throwable $e) {
                $results[] = [
                    'id' => $id,
                    'type' => $type,
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $results;
    }

    public static function toBase64(string $svg): string
    {
        return base64_encode($svg);
    }

    public static function toDataUrl(string $svg, string $mimeType = 'image/svg+xml'): string
    {
        return 'data:' . $mimeType . ';base64,' . base64_encode($svg);
    }
}
