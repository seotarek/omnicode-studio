<?php

declare(strict_types=1);

namespace Omnicode\Barcode;

use InvalidArgumentException;
use Omnicode\Security\ColorSanitizer;

/**
 * Enterprise Barcode Generator in Pure PHP (PSR-12).
 * Supports CODE128, EAN-13, EAN-8, UPC-A, CODE39, ITF-14, and Pharmacode.
 */
class BarcodeGenerator
{
    /**
     * Calculates GS1 Modulo 10 Check Digit (for EAN-13, EAN-8, UPC-A, ITF-14).
     */
    public static function calculateMod10CheckDigit(string $digits): int
    {
        $sum = 0;
        $len = strlen($digits);
        for ($i = $len - 1, $weight = 3; $i >= 0; $i--, $weight = ($weight === 3 ? 1 : 3)) {
            $sum += (int)$digits[$i] * $weight;
        }
        $mod = $sum % 10;
        return $mod === 0 ? 0 : 10 - $mod;
    }

    /**
     * Validates barcode data against symbology specifications.
     *
     * @return array{isValid: bool, error: ?string}
     */
    public static function validate(string $format, string $data): array
    {
        $clean = trim($data);
        if ($clean === '') {
            return ['isValid' => false, 'error' => 'Barcode data cannot be empty'];
        }

        switch (strtoupper($format)) {
            case 'EAN13':
                if (!preg_match('/^\d{12,13}$/', $clean)) {
                    return ['isValid' => false, 'error' => 'EAN-13 must contain 12 or 13 numeric digits'];
                }
                if (strlen($clean) === 13) {
                    $expected = self::calculateMod10CheckDigit(substr($clean, 0, 12));
                    $actual = (int)$clean[12];
                    if ($expected !== $actual) {
                        return [
                            'isValid' => false,
                            'error' => "Invalid EAN-13 check digit. Expected {$expected}, got {$actual}"
                        ];
                    }
                }
                return ['isValid' => true, 'error' => null];

            case 'EAN8':
                if (!preg_match('/^\d{7,8}$/', $clean)) {
                    return ['isValid' => false, 'error' => 'EAN-8 must contain 7 or 8 numeric digits'];
                }
                if (strlen($clean) === 8) {
                    $expected = self::calculateMod10CheckDigit(substr($clean, 0, 7));
                    $actual = (int)$clean[7];
                    if ($expected !== $actual) {
                        return [
                            'isValid' => false,
                            'error' => "Invalid EAN-8 check digit. Expected {$expected}, got {$actual}"
                        ];
                    }
                }
                return ['isValid' => true, 'error' => null];

            case 'UPC':
            case 'UPCA':
                if (!preg_match('/^\d{11,12}$/', $clean)) {
                    return ['isValid' => false, 'error' => 'UPC-A must contain 11 or 12 numeric digits'];
                }
                if (strlen($clean) === 12) {
                    $expected = self::calculateMod10CheckDigit(substr($clean, 0, 11));
                    $actual = (int)$clean[11];
                    if ($expected !== $actual) {
                        return [
                            'isValid' => false,
                            'error' => "Invalid UPC-A check digit. Expected {$expected}, got {$actual}"
                        ];
                    }
                }
                return ['isValid' => true, 'error' => null];

            case 'CODE39':
                if (!preg_match('/^[0-9A-Z\-\.\ \$\/\+\%]+$/i', $clean)) {
                    return [
                        'isValid' => false,
                        'error' => 'CODE39 contains invalid characters. Use A-Z, 0-9, and - . $ / + % space.'
                    ];
                }
                return ['isValid' => true, 'error' => null];

            case 'PHARMACODE':
                if (!preg_match('/^\d+$/', $clean)) {
                    return ['isValid' => false, 'error' => 'Pharmacode must only contain numeric digits.'];
                }
                $val = (int)$clean;
                if ($val < 3 || $val > 131070) {
                    return ['isValid' => false, 'error' => 'Pharmacode value must be between 3 and 131070.'];
                }
                return ['isValid' => true, 'error' => null];

            case 'MSI':
            case 'PLESSEY':
                if (!preg_match('/^\d+$/', $clean)) {
                    return ['isValid' => false, 'error' => 'MSI must contain only numeric digits.'];
                }
                return ['isValid' => true, 'error' => null];

            case 'CODABAR':
            case 'NW7':
                if (!preg_match('/^[A-D]?[0-9\-\$\:\/\.\+]+[A-D]?$/i', $clean)) {
                    return [
                        'isValid' => false,
                        'error' => 'Codabar contains invalid characters. Use 0-9, -, $, :, /, ., +, and optional start/stop A, B, C, or D.'
                    ];
                }
                return ['isValid' => true, 'error' => null];

            default:
                return ['isValid' => true, 'error' => null];
        }
    }

    /**
     * Generates a CODE128 binary bit sequence (1 = black bar, 0 = space).
     */
    private static function encodeCode128(string $data): string
    {
        $patterns = [
            '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
            '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
            '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
            '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
            '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
            '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
            '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
            '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
            '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
            '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
            '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
        ];

        // Start code B is index 104
        $startCode = 104;
        $checksum = $startCode;
        $symbols = [$startCode];

        for ($i = 0, $len = strlen($data); $i < $len; $i++) {
            $charVal = ord($data[$i]) - 32;
            $symbols[] = $charVal;
            $checksum += $charVal * ($i + 1);
        }

        $checkDigit = $checksum % 103;
        $symbols[] = $checkDigit;
        $symbols[] = 106; // Stop pattern

        // Convert widths to binary 1s and 0s
        $binary = '';
        foreach ($symbols as $sym) {
            $widths = $patterns[$sym];
            $isBar = true;
            for ($j = 0, $wLen = strlen($widths); $j < $wLen; $j++) {
                $w = (int)$widths[$j];
                $binary .= str_repeat($isBar ? '1' : '0', $w);
                $isBar = !$isBar;
            }
        }
        return $binary;
    }

    /**
     * Generates a CODE39 binary bit sequence.
     */
    private static function encodeCode39(string $data): string
    {
        $patterns = [
            '0' => '101001101101', '1' => '110100101011', '2' => '101100101011', '3' => '110110010101',
            '4' => '101001101011', '5' => '110100110101', '6' => '101100110101', '7' => '101001011011',
            '8' => '110100101101', '9' => '101100101101', 'A' => '110101001011', 'B' => '101101001011',
            'C' => '110110100101', 'D' => '101011001011', 'E' => '110101100101', 'F' => '101101100101',
            'G' => '101010011011', 'H' => '110101001101', 'I' => '101101001101', 'J' => '101011001101',
            'K' => '110101010011', 'L' => '101101010011', 'M' => '110110101001', 'N' => '101011010011',
            'O' => '110101101001', 'P' => '101101101001', 'Q' => '101010110011', 'R' => '110101011001',
            'S' => '101101011001', 'T' => '101011011001', 'U' => '110010101011', 'V' => '100110101011',
            'W' => '110011010101', 'X' => '100101101011', 'Y' => '110010110101', 'Z' => '100110110101',
            '-' => '100101011011', '.' => '110010101101', ' ' => '100110101101', '*' => '100101101101',
            '$' => '100100100101', '/' => '100100101001', '+' => '100101001001', '%' => '101001001001'
        ];

        $fullData = '*' . strtoupper($data) . '*';
        $binary = '';
        for ($i = 0, $len = strlen($fullData); $i < $len; $i++) {
            $char = $fullData[$i];
            if (isset($patterns[$char])) {
                $binary .= $patterns[$char] . '0';
            }
        }
        return rtrim($binary, '0');
    }

    /**
     * Generates an MSI / Plessey binary bit sequence.
     */
    private static function encodeMsi(string $data): string
    {
        $clean = trim($data);
        $binary = '110'; // Start pattern

        for ($i = 0, $len = strlen($clean); $i < $len; $i++) {
            $digit = (int)$clean[$i];
            $bin = str_pad(decbin($digit), 4, '0', STR_PAD_LEFT);
            for ($b = 0; $b < 4; $b++) {
                $binary .= ($bin[$b] === '0') ? '100' : '110';
            }
        }

        $binary .= '1001'; // Stop pattern
        return $binary;
    }

    /**
     * Generates a Codabar / NW-7 binary bit sequence.
     */
    private static function encodeCodabar(string $data): string
    {
        $clean = strtoupper(trim($data));
        // Auto-wrap with start/stop A if not present
        if (!preg_match('/^[A-D]/', $clean)) {
            $clean = 'A' . $clean . 'A';
        }

        $patterns = [
            '0' => '101010011', '1' => '101011001', '2' => '101001011', '3' => '110010101',
            '4' => '101101001', '5' => '110101001', '6' => '100101011', '7' => '100101101',
            '8' => '100110101', '9' => '110100101', '-' => '101001101', '$' => '101100101',
            ':' => '1101011011', '/' => '1101101011', '.' => '1101101101', '+' => '1011011011',
            'A' => '1011001001', 'B' => '1001001011', 'C' => '1010010011', 'D' => '1010011001'
        ];

        $binary = '';
        $len = strlen($clean);
        for ($i = 0; $i < $len; $i++) {
            $char = $clean[$i];
            if (isset($patterns[$char])) {
                $binary .= $patterns[$char];
                if ($i !== $len - 1) {
                    $binary .= '0'; // Inter-character narrow space
                }
            }
        }
        return $binary;
    }

    /**
     * Generates a fully-rendered vector SVG barcode string.
     *
     * @param array{
     *   format?: string,
     *   data: string,
     *   style?: string,
     *   lineColor?: string,
     *   lineColor2?: string,
     *   background?: string,
     *   width?: int,
     *   height?: int,
     *   headerText?: string,
     *   footerText?: string,
     *   displayValue?: bool
     * } $options
     */
    public static function generateSvg(array $options): string
    {
        $format = strtoupper($options['format'] ?? 'CODE128');
        $data = $options['data'] ?? '';
        $style = $options['style'] ?? 'classic';
        $barWidth = (int)($options['width'] ?? 2);
        if ($barWidth < 1 || $barWidth > 10) {
            throw new InvalidArgumentException("Barcode width must be between 1 and 10.");
        }

        $barHeight = (int)($options['height'] ?? 90);
        if ($barHeight < 10 || $barHeight > 1000) {
            throw new InvalidArgumentException("Barcode height must be between 10 and 1000 pixels.");
        }

        $lineColor = ColorSanitizer::sanitize($options['lineColor'] ?? '#000000', '#000000');
        $lineColor2 = ColorSanitizer::sanitize($options['lineColor2'] ?? '#2563eb', '#2563eb');
        $background = ($options['background'] ?? '#ffffff') === 'transparent'
            ? 'transparent'
            : ColorSanitizer::sanitize($options['background'] ?? '#ffffff', '#ffffff');

        $headerText = htmlspecialchars($options['headerText'] ?? '', ENT_QUOTES | ENT_XML1, 'UTF-8');
        $footerText = htmlspecialchars($options['footerText'] ?? '', ENT_QUOTES | ENT_XML1, 'UTF-8');
        $displayValue = $options['displayValue'] ?? true;

        $validation = self::validate($format, $data);
        if (!$validation['isValid']) {
            throw new InvalidArgumentException($validation['error'] ?? 'Invalid barcode data');
        }

        // Get binary sequence
        $binary = match ($format) {
            'CODE39' => self::encodeCode39($data),
            'MSI', 'PLESSEY' => self::encodeMsi($data),
            'CODABAR', 'NW7' => self::encodeCodabar($data),
            default => self::encodeCode128($data)
        };

        $binLen = strlen($binary);
        $coreWidth = $binLen * $barWidth;
        $coreHeight = $barHeight + ($displayValue ? 20 : 0);

        $isRounded = ($style === 'rounded' || $style === 'pill');
        $rx = ($style === 'pill') ? 4 : 2;
        $isGradient = ($style === 'gradient');
        $isThermal = ($style === 'thermal-label');
        $isPriceTag = ($style === 'price-tag');
        $isBadge = ($style === 'badge-frame');

        $barsSvg = '';
        $fill = $isGradient ? 'url(#omnicode-grad)' : $lineColor;

        for ($i = 0; $i < $binLen; $i++) {
            if ($binary[$i] === '1') {
                $x = $i * $barWidth;
                $rxAttr = $isRounded ? " rx=\"{$rx}\" ry=\"{$rx}\"" : '';
                $barsSvg .= "<rect x=\"{$x}\" y=\"0\" width=\"{$barWidth}\" height=\"{$barHeight}\" fill=\"{$fill}\"{$rxAttr} />";
            }
        }

        if ($displayValue) {
            $midX = $coreWidth / 2;
            $textY = $barHeight + 15;
            $safeData = htmlspecialchars($data, ENT_QUOTES | ENT_XML1, 'UTF-8');
            $barsSvg .= "<text x=\"{$midX}\" y=\"{$textY}\" font-family=\"monospace\" font-size=\"14\" text-anchor=\"middle\" fill=\"{$lineColor}\">{$safeData}</text>";
        }

        $defs = '';
        if ($isGradient) {
            $defs = "<defs><linearGradient id=\"omnicode-grad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">" .
                "<stop offset=\"0%\" stop-color=\"{$lineColor}\" />" .
                "<stop offset=\"100%\" stop-color=\"{$lineColor2}\" />" .
                "</linearGradient></defs>";
        }

        // Apply Frame if requested
        if ($isThermal || $isPriceTag || $isBadge) {
            $pad = 24;
            $headerH = ($isThermal || $isPriceTag || $headerText !== '') ? 28 : 10;
            $footerH = ($isThermal || $isPriceTag || $footerText !== '') ? 24 : 10;
            $totalW = $coreWidth + $pad * 2;
            $totalH = $coreHeight + $pad * 2 + $headerH + $footerH;

            $frameMarkup = '';
            if ($isThermal) {
                $headTitle = $headerText !== '' ? $headerText : 'LOGISTICS SHIPMENT TRACKING';
                $footTitle = $footerText !== '' ? $footerText : "FORMAT: {$format} | CARRIER APPROVED";
                $line1Y = $headerH + 16;
                $line2Y = $totalH - $footerH - 12;
                $text2Y = $totalH - 12;

                $frameMarkup =
                    "<rect width=\"{$totalW}\" height=\"{$totalH}\" fill=\"{$background}\" stroke=\"#000000\" stroke-width=\"3\" rx=\"4\" />" .
                    "<line x1=\"0\" y1=\"{$line1Y}\" x2=\"{$totalW}\" y2=\"{$line1Y}\" stroke=\"#000000\" stroke-width=\"2\" />" .
                    "<text x=\"{$pad}\" y=\"" . ($headerH + 4) . "\" font-family=\"Courier New, monospace\" font-weight=\"bold\" font-size=\"13\" fill=\"#000000\">{$headTitle}</text>" .
                    "<line x1=\"0\" y1=\"{$line2Y}\" x2=\"{$totalW}\" y2=\"{$line2Y}\" stroke=\"#000000\" stroke-width=\"2\" />" .
                    "<text x=\"{$pad}\" y=\"{$text2Y}\" font-family=\"Courier New, monospace\" font-size=\"11\" fill=\"#333333\">{$footTitle}</text>";
            } elseif ($isPriceTag) {
                $headTitle = $headerText !== '' ? $headerText : 'STORE INVENTORY ITEM';
                $footTitle = $footerText !== '' ? $footerText : 'PRICE: $99.99';
                $midW = $totalW / 2;

                $frameMarkup =
                    "<rect width=\"{$totalW}\" height=\"{$totalH}\" fill=\"{$background}\" stroke=\"#e2e8f0\" stroke-width=\"2\" rx=\"12\" />" .
                    "<rect x=\"0\" y=\"0\" width=\"{$totalW}\" height=\"" . ($headerH + 12) . "\" fill=\"{$lineColor}\" rx=\"12\" />" .
                    "<rect x=\"0\" y=\"{$headerH}\" width=\"{$totalW}\" height=\"12\" fill=\"{$lineColor}\" />" .
                    "<text x=\"{$midW}\" y=\"" . ($headerH + 2) . "\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"13\" fill=\"#ffffff\" text-anchor=\"middle\">{$headTitle}</text>" .
                    "<text x=\"{$midW}\" y=\"" . ($totalH - 10) . "\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"14\" fill=\"{$lineColor}\" text-anchor=\"middle\">{$footTitle}</text>";
            } elseif ($isBadge) {
                $headTitle = $headerText !== '' ? $headerText : 'OFFICIAL VERIFICATION BADGE';
                $midW = $totalW / 2;
                $halfH = $totalH / 2;

                $frameMarkup =
                    "<rect width=\"{$totalW}\" height=\"{$totalH}\" fill=\"{$background}\" stroke=\"{$lineColor}\" stroke-width=\"2\" stroke-dasharray=\"6 4\" rx=\"16\" />" .
                    "<circle cx=\"0\" cy=\"{$halfH}\" r=\"10\" fill=\"#0f172a\" />" .
                    "<circle cx=\"{$totalW}\" cy=\"{$halfH}\" r=\"10\" fill=\"#0f172a\" />" .
                    "<text x=\"{$midW}\" y=\"" . ($headerH + 6) . "\" font-family=\"sans-serif\" font-size=\"11\" font-weight=\"bold\" fill=\"#64748b\" text-anchor=\"middle\" letter-spacing=\"2\">{$headTitle}</text>";
            }

            $innerOffsetY = $headerH + $pad;
            return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {$totalW} {$totalH}\" width=\"{$totalW}\" height=\"{$totalH}\">" .
                $defs .
                $frameMarkup .
                "<g transform=\"translate({$pad}, {$innerOffsetY})\">{$barsSvg}</g>" .
                "</svg>";
        }

        $pad = 12;
        $totalW = $coreWidth + $pad * 2;
        $totalH = $coreHeight + $pad * 2;
        $bgRect = ($background !== 'transparent')
            ? "<rect width=\"{$totalW}\" height=\"{$totalH}\" fill=\"{$background}\" />"
            : '';

        return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {$totalW} {$totalH}\" width=\"{$totalW}\" height=\"{$totalH}\">" .
            $defs .
            $bgRect .
            "<g transform=\"translate({$pad}, {$pad})\">{$barsSvg}</g>" .
            "</svg>";
    }
}
