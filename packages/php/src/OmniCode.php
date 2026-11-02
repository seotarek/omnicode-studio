<?php

declare(strict_types=1);

namespace Omnicode;

use Omnicode\Barcode\BarcodeGenerator;
use Omnicode\Qr\QrCodeGenerator;
use Omnicode\Payload\PayloadBuilder;
use Omnicode\Validator\ScannabilityValidator;

/**
 * OmniCode Engine Entry Point.
 */
class OmniCode
{
    public static function barcode(string $data, string $format = 'CODE128', array $options = []): string
    {
        return BarcodeGenerator::generateSvg(array_merge([
            'data' => $data,
            'format' => $format
        ], $options));
    }

    public static function qr(string $data, array $options = []): string
    {
        return QrCodeGenerator::generateSvg(array_merge([
            'data' => $data
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
}
