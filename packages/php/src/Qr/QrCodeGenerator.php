<?php

declare(strict_types=1);

namespace Omnicode\Qr;

use InvalidArgumentException;

/**
 * Enterprise QR Code Generator in Pure PHP (PSR-12).
 * Supports Error Correction levels (L, M, Q, H), custom dot shapes,
 * gradients, safe logo embedding, and pure vector SVG rendering.
 */
class QrCodeGenerator
{
    /**
     * GF(256) Log and Anti-Log tables for Reed-Solomon computation.
     */
    private static ?array $expTable = null;
    private static ?array $logTable = null;

    private static function initGalois(): void
    {
        if (self::$expTable !== null) return;
        self::$expTable = array_fill(0, 512, 0);
        self::$logTable = array_fill(0, 256, 0);
        $x = 1;
        for ($i = 0; $i < 255; $i++) {
            self::$expTable[$i] = $x;
            self::$expTable[$i + 255] = $x;
            self::$logTable[$x] = $i;
            $x <<= 1;
            if ($x & 0x100) {
                $x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
            }
        }
    }

    private static function gmul(int $a, int $b): int
    {
        if ($a === 0 || $b === 0) return 0;
        return self::$expTable[self::$logTable[$a] + self::$logTable[$b]];
    }

    private static function getRsGeneratorPoly(int $ecCount): array
    {
        $poly = [1];
        for ($i = 0; $i < $ecCount; $i++) {
            $term = [1, self::$expTable[$i]];
            $next = array_fill(0, count($poly) + 1, 0);
            for ($j = 0; $j < count($poly); $j++) {
                $next[$j] ^= self::gmul($poly[$j], $term[0]);
                $next[$j + 1] ^= self::gmul($poly[$j], $term[1]);
            }
            $poly = $next;
        }
        return $poly;
    }

    private static function calculateRsEcc(array $data, int $ecCount): array
    {
        self::initGalois();
        $generator = self::getRsGeneratorPoly($ecCount);
        $info = array_merge($data, array_fill(0, $ecCount, 0));
        $dataLen = count($data);

        for ($i = 0; $i < $dataLen; $i++) {
            $coef = $info[$i];
            if ($coef !== 0) {
                for ($j = 0; $j < count($generator); $j++) {
                    $info[$i + $j] ^= self::gmul($generator[$j], $coef);
                }
            }
        }
        return array_slice($info, $dataLen);
    }

    /**
     * Determines QR Version required for byte data length and ECC.
     */
    private static function getVersion(int $dataLen, string $ecLevel): int
    {
        // Capacities for Version 1 to 10 in Byte mode [L, M, Q, H]
        $capacities = [
            1 => ['L' => 17, 'M' => 14, 'Q' => 11, 'H' => 7],
            2 => ['L' => 32, 'M' => 26, 'Q' => 20, 'H' => 14],
            3 => ['L' => 53, 'M' => 42, 'Q' => 32, 'H' => 24],
            4 => ['L' => 78, 'M' => 62, 'Q' => 46, 'H' => 34],
            5 => ['L' => 106, 'M' => 84, 'Q' => 60, 'H' => 44],
            6 => ['L' => 134, 'M' => 106, 'Q' => 74, 'H' => 58],
            7 => ['L' => 154, 'M' => 122, 'Q' => 86, 'H' => 64],
            8 => ['L' => 192, 'M' => 152, 'Q' => 108, 'H' => 84],
            9 => ['L' => 230, 'M' => 180, 'Q' => 130, 'H' => 98],
            10 => ['L' => 271, 'M' => 213, 'Q' => 151, 'H' => 119]
        ];

        foreach ($capacities as $v => $caps) {
            if ($dataLen <= $caps[$ecLevel]) {
                return $v;
            }
        }
        return 10;
    }

    /**
     * Generates a 2D boolean matrix of QR code modules (true = dark, false = light).
     *
     * @return array<int, array<int, bool>>
     */
    public static function generateMatrix(string $data, string $ecLevel = 'M'): array
    {
        $ecLevel = strtoupper($ecLevel);
        if (!in_array($ecLevel, ['L', 'M', 'Q', 'H'], true)) {
            $ecLevel = 'M';
        }

        $dataBytes = array_values(unpack('C*', $data));
        $version = self::getVersion(count($dataBytes), $ecLevel);
        $size = 17 + 4 * $version;

        $matrix = array_fill(0, $size, array_fill(0, $size, null));

        // Place Finder Patterns
        self::placeFinder($matrix, 0, 0);
        self::placeFinder($matrix, 0, $size - 7);
        self::placeFinder($matrix, $size - 7, 0);

        // Place Timing Patterns
        for ($i = 8; $i < $size - 8; $i++) {
            $isDark = ($i % 2 === 0);
            if ($matrix[6][$i] === null) $matrix[6][$i] = $isDark;
            if ($matrix[$i][6] === null) $matrix[$i][6] = $isDark;
        }

        // Dark module
        $matrix[$size - 8][8] = true;

        // Alignment patterns for version >= 2
        if ($version >= 2) {
            $pos = [6, $size - 7];
            foreach ($pos as $r) {
                foreach ($pos as $c) {
                    if ($matrix[$r][$c] === null) {
                        self::placeAlignment($matrix, $r - 2, $c - 2);
                    }
                }
            }
        }

        // Prepare Bit Stream (Byte Mode: 0100 + char count + data + padding + ECC)
        $bits = '0100';
        $bits .= str_pad(decbin(count($dataBytes)), 8, '0', STR_PAD_LEFT);
        foreach ($dataBytes as $byte) {
            $bits .= str_pad(decbin($byte), 8, '0', STR_PAD_LEFT);
        }
        // Terminator
        $bits .= '0000';
        while (strlen($bits) % 8 !== 0) $bits .= '0';

        // Pad bytes (0xEC, 0x11)
        $codewords = [];
        for ($i = 0; $i < strlen($bits); $i += 8) {
            $codewords[] = bindec(substr($bits, $i, 8));
        }

        $totalDataCodewords = [
            1 => ['L' => 19, 'M' => 16, 'Q' => 13, 'H' => 9],
            2 => ['L' => 34, 'M' => 28, 'Q' => 22, 'H' => 16],
            3 => ['L' => 55, 'M' => 44, 'Q' => 34, 'H' => 26],
            4 => ['L' => 80, 'M' => 64, 'Q' => 48, 'H' => 36],
            5 => ['L' => 108, 'M' => 86, 'Q' => 62, 'H' => 46],
        ][$version][$ecLevel] ?? 20;

        $padBytes = [0xEC, 0x11];
        $pIdx = 0;
        while (count($codewords) < $totalDataCodewords) {
            $codewords[] = $padBytes[$pIdx % 2];
            $pIdx++;
        }

        $ecCount = [
            1 => ['L' => 7, 'M' => 10, 'Q' => 13, 'H' => 17],
            2 => ['L' => 10, 'M' => 16, 'Q' => 22, 'H' => 28],
            3 => ['L' => 15, 'M' => 26, 'Q' => 36, 'H' => 44],
            4 => ['L' => 20, 'M' => 36, 'Q' => 52, 'H' => 64],
            5 => ['L' => 26, 'M' => 48, 'Q' => 72, 'H' => 88],
        ][$version][$ecLevel] ?? 10;

        $ecc = self::calculateRsEcc($codewords, $ecCount);
        $fullCodewords = array_merge($codewords, $ecc);

        // Convert codewords to final bit array
        $finalBits = '';
        foreach ($fullCodewords as $cw) {
            $finalBits .= str_pad(decbin($cw), 8, '0', STR_PAD_LEFT);
        }

        // Place bits into matrix
        $bitIdx = 0;
        $bitLen = strlen($finalBits);
        $dir = -1;
        $row = $size - 1;

        for ($col = $size - 1; $col > 0; $col -= 2) {
            if ($col === 6) $col--; // skip vertical timing line
            while (true) {
                for ($c = 0; $c < 2; $c++) {
                    $currCol = $col - $c;
                    if ($matrix[$row][$currCol] === null) {
                        $isDark = ($bitIdx < $bitLen && $finalBits[$bitIdx] === '1');
                        // Apply Mask Pattern 0: (row + col) % 2 === 0
                        if (($row + $currCol) % 2 === 0) {
                            $isDark = !$isDark;
                        }
                        $matrix[$row][$currCol] = $isDark;
                        $bitIdx++;
                    }
                }
                $row += $dir;
                if ($row < 0 || $row >= $size) {
                    $dir = -$dir;
                    $row += $dir;
                    break;
                }
            }
        }

        // Fill any remaining nulls with false
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                if ($matrix[$r][$c] === null) {
                    $matrix[$r][$c] = false;
                }
            }
        }

        return $matrix;
    }

    private static function placeFinder(array &$matrix, int $r, int $c): void
    {
        for ($i = -1; $i <= 7; $i++) {
            for ($j = -1; $j <= 7; $j++) {
                $row = $r + $i;
                $col = $c + $j;
                if ($row < 0 || $row >= count($matrix) || $col < 0 || $col >= count($matrix)) {
                    continue;
                }
                if ($i === -1 || $i === 7 || $j === -1 || $j === 7) {
                    $matrix[$row][$col] = false;
                } elseif ($i === 0 || $i === 6 || $j === 0 || $j === 6) {
                    $matrix[$row][$col] = true;
                } elseif ($i >= 2 && $i <= 4 && $j >= 2 && $j <= 4) {
                    $matrix[$row][$col] = true;
                } else {
                    $matrix[$row][$col] = false;
                }
            }
        }
    }

    private static function placeAlignment(array &$matrix, int $r, int $c): void
    {
        for ($i = 0; $i < 5; $i++) {
            for ($j = 0; $j < 5; $j++) {
                $isOuter = ($i === 0 || $i === 4 || $j === 0 || $j === 4);
                $isCenter = ($i === 2 && $j === 2);
                $matrix[$r + $i][$c + $j] = ($isOuter || $isCenter);
            }
        }
    }

    /**
     * Renders a QR code to vector SVG string.
     *
     * @param array{
     *   data: string,
     *   ecLevel?: string,
     *   size?: int,
     *   margin?: int,
     *   fgColor?: string,
     *   fgColor2?: string,
     *   bgColor?: string,
     *   isGradient?: bool,
     *   dotType?: string,
     *   logoUrl?: ?string
     * } $options
     */
    public static function generateSvg(array $options): string
    {
        $data = $options['data'] ?? 'https://omnicode.studio';
        $ecLevel = $options['ecLevel'] ?? 'M';
        $targetSize = $options['size'] ?? 360;
        $margin = $options['margin'] ?? 16;
        $fgColor = $options['fgColor'] ?? '#000000';
        $fgColor2 = $options['fgColor2'] ?? '#2563eb';
        $bgColor = $options['bgColor'] ?? '#ffffff';
        $isGradient = $options['isGradient'] ?? false;
        $dotType = $options['dotType'] ?? 'square';
        $logoUrl = $options['logoUrl'] ?? null;

        $matrix = self::generateMatrix($data, $ecLevel);
        $moduleCount = count($matrix);
        $contentSize = $targetSize - ($margin * 2);
        $moduleSize = $contentSize / $moduleCount;

        $fill = $isGradient ? 'url(#omnicode-qr-grad)' : $fgColor;
        $defs = '';
        if ($isGradient) {
            $defs = "<defs><linearGradient id=\"omnicode-qr-grad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">" .
                "<stop offset=\"0%\" stop-color=\"{$fgColor}\" />" .
                "<stop offset=\"100%\" stop-color=\"{$fgColor2}\" />" .
                "</linearGradient></defs>";
        }

        $bgRect = ($bgColor !== 'transparent')
            ? "<rect width=\"{$targetSize}\" height=\"{$targetSize}\" fill=\"{$bgColor}\" />"
            : '';

        $elements = '';
        $rx = ($dotType === 'rounded') ? ($moduleSize * 0.3) : (($dotType === 'dots') ? ($moduleSize * 0.5) : 0);

        for ($r = 0; $r < $moduleCount; $r++) {
            for ($c = 0; $c < $moduleCount; $c++) {
                if ($matrix[$r][$c]) {
                    $x = $margin + ($c * $moduleSize);
                    $y = $margin + ($r * $moduleSize);
                    $w = $moduleSize;
                    $h = $moduleSize;

                    if ($rx > 0) {
                        $elements .= "<rect x=\"{$x}\" y=\"{$y}\" width=\"{$w}\" height=\"{$h}\" rx=\"{$rx}\" ry=\"{$rx}\" fill=\"{$fill}\" />";
                    } else {
                        $elements .= "<rect x=\"{$x}\" y=\"{$y}\" width=\"{$w}\" height=\"{$h}\" fill=\"{$fill}\" />";
                    }
                }
            }
        }

        $logoSvg = '';
        if ($logoUrl !== null && $logoUrl !== '') {
            $safeLogo = htmlspecialchars($logoUrl, ENT_QUOTES | ENT_XML1, 'UTF-8');
            $logoDim = $targetSize * 0.22;
            $logoX = ($targetSize - $logoDim) / 2;
            $logoY = ($targetSize - $logoDim) / 2;
            $pad = 6;
            $boxDim = $logoDim + ($pad * 2);
            $boxX = $logoX - $pad;
            $boxY = $logoY - $pad;

            $logoSvg = "<g id=\"qr-logo-overlay\">" .
                "<rect x=\"{$boxX}\" y=\"{$boxY}\" width=\"{$boxDim}\" height=\"{$boxDim}\" rx=\"8\" ry=\"8\" fill=\"#ffffff\" />" .
                "<image href=\"{$safeLogo}\" x=\"{$logoX}\" y=\"{$logoY}\" width=\"{$logoDim}\" height=\"{$logoDim}\" preserveAspectRatio=\"xMidYMid meet\" />" .
                "</g>";
        }

        return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {$targetSize} {$targetSize}\" width=\"{$targetSize}\" height=\"{$targetSize}\">" .
            $defs .
            $bgRect .
            $elements .
            $logoSvg .
            "</svg>";
    }
}
