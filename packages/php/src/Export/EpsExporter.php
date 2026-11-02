<?php

declare(strict_types=1);

namespace Omnicode\Export;

use InvalidArgumentException;
use Omnicode\Security\ColorSanitizer;

/**
 * Enterprise Encapsulated PostScript (EPS) Vector Exporter for Pure PHP.
 * Conforms to Adobe PostScript Language Level 2/3 EPS Specifications.
 */
class EpsExporter
{
    /**
     * Converts an SVG string (Barcode or QR Code) to standard EPS PostScript format.
     *
     * @param array{
     *   title?: string,
     *   creator?: string,
     *   barWidthReduction?: float
     * } $options
     */
    public static function fromSvg(string $svg, array $options = []): string
    {
        $title = $options['title'] ?? 'OmniCode Vector Barcode/QR';
        $creator = $options['creator'] ?? 'OmniCode PHP Engine v1.0';
        $bwr = (float)($options['barWidthReduction'] ?? 0.0);

        // Extract dimensions
        $width = 300.0;
        $height = 300.0;

        if (preg_match('/viewBox=["\']([^"\']+)["\']/i', $svg, $vbMatch)) {
            $parts = preg_split('/[\s,]+/', trim($vbMatch[1]));
            if (count($parts) === 4 && (float)$parts[2] > 0 && (float)$parts[3] > 0) {
                $width = (float)$parts[2];
                $height = (float)$parts[3];
            }
        } elseif (preg_match('/width=["\']([\d.]+)["\']/i', $svg, $wMatch) &&
                  preg_match('/height=["\']([\d.]+)["\']/i', $svg, $hMatch)) {
            $width = (float)$wMatch[1];
            $height = (float)$hMatch[1];
        }

        $psCommands = [];
        $currentColor = null;

        $setColor = function (array $rgb) use (&$psCommands, &$currentColor) {
            if ($currentColor === null || $currentColor !== $rgb) {
                $currentColor = $rgb;
                $psCommands[] = sprintf('%.3f %.3f %.3f setrgbcolor', $rgb[0], $rgb[1], $rgb[2]);
            }
        };

        // 1. Process <rect>
        if (preg_match_all('/<rect\b([^>]*)\/?>/i', $svg, $rectMatches)) {
            foreach ($rectMatches[1] as $attrs) {
                $x = preg_match('/\bx=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $y = preg_match('/\by=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $w = preg_match('/\bwidth=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $h = preg_match('/\bheight=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $fill = preg_match('/\bfill=["\']([^"\']+)["\']/', $attrs, $m) ? $m[1] : '';

                if ($w <= 0 || $h <= 0) {
                    continue;
                }
                $rgb = self::parseColor($fill);
                if ($rgb === null) {
                    continue;
                }

                $setColor($rgb);
                $effectiveW = max(0.1, $w - $bwr);
                $effectiveX = $x + ($bwr / 2.0);
                $y_ps = $height - ($y + $h);
                $psCommands[] = sprintf('%.3f %.3f %.3f %.3f rf', $effectiveX, $y_ps, $effectiveW, $h);
            }
        }

        // 2. Process <circle>
        if (preg_match_all('/<circle\b([^>]*)\/?>/i', $svg, $circleMatches)) {
            foreach ($circleMatches[1] as $attrs) {
                $cx = preg_match('/\bcx=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $cy = preg_match('/\bcy=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $r = preg_match('/\br=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $fill = preg_match('/\bfill=["\']([^"\']+)["\']/', $attrs, $m) ? $m[1] : '';

                if ($r <= 0) {
                    continue;
                }
                $rgb = self::parseColor($fill);
                if ($rgb === null) {
                    continue;
                }

                $setColor($rgb);
                $cy_ps = $height - $cy;
                $psCommands[] = sprintf('%.3f %.3f %.3f cf', $cx, $cy_ps, $r);
            }
        }

        // 3. Process <line>
        if (preg_match_all('/<line\b([^>]*)\/?>/i', $svg, $lineMatches)) {
            foreach ($lineMatches[1] as $attrs) {
                $x1 = preg_match('/\bx1=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $y1 = preg_match('/\by1=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $x2 = preg_match('/\bx2=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $y2 = preg_match('/\by2=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $stroke = preg_match('/\bstroke=["\']([^"\']+)["\']/', $attrs, $m) ? $m[1] : '';
                $sw = preg_match('/\bstroke-width=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 1.0;

                $rgb = self::parseColor($stroke);
                if ($rgb === null) {
                    continue;
                }

                $setColor($rgb);
                $y1_ps = $height - $y1;
                $y2_ps = $height - $y2;
                $psCommands[] = sprintf('%.3f %.3f %.3f %.3f %.2f ln', $x1, $y1_ps, $x2, $y2_ps, $sw);
            }
        }

        // 4. Process <polygon>
        if (preg_match_all('/<polygon\b([^>]*)\/?>/i', $svg, $polyMatches)) {
            foreach ($polyMatches[1] as $attrs) {
                $points = preg_match('/\bpoints=["\']([^"\']+)["\']/', $attrs, $m) ? $m[1] : '';
                $fill = preg_match('/\bfill=["\']([^"\']+)["\']/', $attrs, $m) ? $m[1] : '';

                if ($points === '') {
                    continue;
                }
                $rgb = self::parseColor($fill);
                if ($rgb === null) {
                    continue;
                }

                $coords = array_map('floatval', preg_split('/[\s,]+/', trim($points)));
                if (count($coords) < 4) {
                    continue;
                }

                $setColor($rgb);
                $firstX = $coords[0];
                $firstY = $height - $coords[1];
                $polyCmd = sprintf('newpath %.3f %.3f moveto', $firstX, $firstY);
                for ($i = 2; $i < count($coords); $i += 2) {
                    $px = $coords[$i];
                    $py = $height - $coords[$i + 1];
                    $polyCmd .= sprintf(' %.3f %.3f lineto', $px, $py);
                }
                $polyCmd .= ' closepath fill';
                $psCommands[] = $polyCmd;
            }
        }

        // 5. Process <text>
        if (preg_match_all('/<text\b([^>]*)>([\s\S]*?)<\/text>/i', $svg, $textMatches, PREG_SET_ORDER)) {
            foreach ($textMatches as $match) {
                $attrs = $match[1];
                $rawContent = trim(strip_tags($match[2]));
                if ($rawContent === '') {
                    continue;
                }

                $x = preg_match('/\bx=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $y = preg_match('/\by=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 0.0;
                $fontSize = preg_match('/\bfont-size=["\']([^"\']+)["\']/', $attrs, $m) ? (float)$m[1] : 12.0;
                $fill = preg_match('/\bfill=["\']([^"\']+)["\']/', $attrs, $m) ? $m[1] : '#000000';
                $anchor = preg_match('/\btext-anchor=["\']([^"\']+)["\']/', $attrs, $m) ? $m[1] : 'start';

                $rgb = self::parseColor($fill) ?? [0.0, 0.0, 0.0];
                $setColor($rgb);

                $escaped = self::escapePsString($rawContent);
                $y_ps = $height - $y;

                if ($anchor === 'middle') {
                    $psCommands[] = sprintf('(%s) %.3f %.3f %.2f tx_center', $escaped, $x, $y_ps, $fontSize);
                } elseif ($anchor === 'end') {
                    $psCommands[] = sprintf('(%s) %.3f %.3f %.2f tx_right', $escaped, $x, $y_ps, $fontSize);
                } else {
                    $psCommands[] = sprintf('(%s) %.3f %.3f %.2f tx', $escaped, $x, $y_ps, $fontSize);
                }
            }
        }

        $bbW = (int)ceil($width);
        $bbH = (int)ceil($height);

        $header = [
            '%!PS-Adobe-3.0 EPSF-3.0',
            "%%BoundingBox: 0 0 {$bbW} {$bbH}",
            sprintf('%%%%HiResBoundingBox: 0.0000 0.0000 %.4f %.4f', $width, $height),
            "%%Creator: {$creator}",
            "%%Title: {$title}",
            '%%Pages: 1',
            '%%DocumentData: Clean7Bit',
            '%%LanguageLevel: 2',
            '%%EndComments',
            '%%BeginProlog',
            '/rf { newpath 4 2 roll moveto dup 0 rlineto exch 0 exch rlineto neg 0 rlineto closepath fill } bind def',
            '/cf { newpath 0 360 arc fill } bind def',
            '/ln { setlinewidth newpath 4 2 roll moveto lineto stroke } bind def',
            '/tx { /Helvetica findfont exch scalefont setfont moveto show } bind def',
            '/tx_center { /Helvetica findfont exch scalefont setfont 3 1 roll 2 copy moveto pop dup stringwidth pop 2 div 4 -1 roll exch sub 3 -1 roll moveto show } bind def',
            '/tx_right { /Helvetica findfont exch scalefont setfont 3 1 roll 2 copy moveto pop dup stringwidth pop 4 -1 roll exch sub 3 -1 roll moveto show } bind def',
            '%%EndProlog',
            '%%Page: 1 1',
            'gsave'
        ];

        $footer = [
            'grestore',
            'showpage',
            '%%EOF'
        ];

        return implode("\n", $header) . "\n" . implode("\n", $psCommands) . "\n" . implode("\n", $footer) . "\n";
    }

    /**
     * Converts hex or named color to RGB float tuple [0.0..1.0].
     *
     * @return array{0: float, 1: float, 2: float}|null
     */
    public static function parseColor(?string $color): ?array
    {
        if ($color === null || $color === '' || $color === 'none' || $color === 'transparent') {
            return null;
        }

        $str = strtolower(trim($color));
        if ($str === 'black') return [0.0, 0.0, 0.0];
        if ($str === 'white') return [1.0, 1.0, 1.0];

        if (str_starts_with($str, '#')) {
            $hex = ltrim($str, '#');
            if (strlen($hex) === 3) {
                $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
            }
            if (strlen($hex) === 6) {
                return [
                    round(hexdec(substr($hex, 0, 2)) / 255.0, 3),
                    round(hexdec(substr($hex, 2, 2)) / 255.0, 3),
                    round(hexdec(substr($hex, 4, 2)) / 255.0, 3),
                ];
            }
        }

        if (preg_match('/rgba?\((\d+),\s*(\d+),\s*(\d+)/', $str, $m)) {
            return [
                round(((int)$m[1]) / 255.0, 3),
                round(((int)$m[2]) / 255.0, 3),
                round(((int)$m[3]) / 255.0, 3),
            ];
        }

        return [0.0, 0.0, 0.0];
    }

    private static function escapePsString(string $str): string
    {
        $escaped = str_replace(
            ['\\', '(', ')', '&amp;', '&lt;', '&gt;', '&quot;', '&#39;'],
            ['\\\\', '\\(', '\\)', '&', '<', '>', '"', "'"],
            $str
        );
        return $escaped;
    }
}
