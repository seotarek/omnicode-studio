<?php

declare(strict_types=1);

namespace Omnicode\Validator;

class ScannabilityValidator
{
    private static function hexToRgb(string $hex): ?array
    {
        $clean = ltrim(trim($hex), '#');
        if (!preg_match('/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/', $clean)) {
            return null;
        }

        if (strlen($clean) === 3) {
            return [
                'r' => hexdec($clean[0] . $clean[0]),
                'g' => hexdec($clean[1] . $clean[1]),
                'b' => hexdec($clean[2] . $clean[2])
            ];
        }

        return [
            'r' => hexdec(substr($clean, 0, 2)),
            'g' => hexdec(substr($clean, 2, 2)),
            'b' => hexdec(substr($clean, 4, 2))
        ];
    }

    private static function getLuminance(int $r, int $g, int $b): float
    {
        $vals = array_map(function ($v) {
            $v = $v / 255.0;
            return $v <= 0.03928 ? $v / 12.92 : pow(($v + 0.055) / 1.055, 2.4);
        }, [$r, $g, $b]);

        return $vals[0] * 0.2126 + $vals[1] * 0.7152 + $vals[2] * 0.0722;
    }

    public static function calculateContrast(string $fgHex, string $bgHex): float
    {
        $fg = self::hexToRgb($fgHex) ?? ['r' => 0, 'g' => 0, 'b' => 0];
        $bg = self::hexToRgb($bgHex) ?? ['r' => 255, 'g' => 255, 'b' => 255];

        $lum1 = self::getLuminance($fg['r'], $fg['g'], $fg['b']);
        $lum2 = self::getLuminance($bg['r'], $bg['g'], $bg['b']);

        $brightest = max($lum1, $lum2);
        $darkest = min($lum1, $lum2);

        return ($brightest + 0.05) / ($darkest + 0.05);
    }

    public static function validate(string $fgColor, string $bgColor, string $ecLevel = 'M', bool $hasLogo = false, float $logoRatio = 0.2): array
    {
        $warnings = [];
        $score = 100;
        $contrast = self::calculateContrast($fgColor, $bgColor);

        if ($contrast < 2.0) {
            $warnings[] = "Extremely low color contrast (< 2.0:1). Hardware scanners will fail completely.";
            $score -= 60;
        } elseif ($contrast < 4.5) {
            $warnings[] = "Sub-optimal contrast ratio (< 4.5:1). May fail in low-light environments.";
            $score -= 25;
        }

        if ($hasLogo) {
            if ($ecLevel === 'L' || $ecLevel === 'M') {
                $warnings[] = "Logo embedded with low error correction level ({$ecLevel}). Level H (30%) is strictly required.";
                $score -= 30;
            }
            if ($logoRatio > 0.28) {
                $warnings[] = "Logo occupies > 28% of QR code area, risking unrecoverable Reed-Solomon corruption.";
                $score -= 20;
            }
        }

        $score = max(0, min(100, $score));
        $isScannable = $score >= 60 && $contrast >= 3.0;

        return [
            'score' => $score,
            'isScannable' => $isScannable,
            'contrastRatio' => round($contrast, 2),
            'warnings' => $warnings,
            'disclaimer' => "Note: Diagnostic estimation based on ISO/IEC contrast calculations. Verification with target optical hardware is required before mass production."
        ];
    }
}
