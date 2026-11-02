<?php

declare(strict_types=1);

namespace Omnicode\Tests\Support;

use RuntimeException;
use InvalidArgumentException;

/**
 * Pure PHP ISO/IEC 18004 QR Code Matrix Decoder with Reed-Solomon Error Correction.
 * 
 * Standalone standard decoder with zero dependencies on generator internals:
 * - Independent ISO/IEC 18004 Table 9 Block & Capacity definitions
 * - BCH 15,5 format information de-masking
 * - De-interleaves both data and error correction codewords
 * - Algebraic Galois Field GF(2^8) Reed-Solomon error detection and correction
 *   (Syndromes, Berlekamp-Massey, Chien Search, and Forney algorithm)
 * - Decodes 8-bit byte-mode bitstream into UTF-8 payload
 */
class QrCodeDecoder
{
    private const G15_MASK = 0x5412;

    private static ?array $EXP_TABLE = null;
    private static ?array $LOG_TABLE = null;

    private static array $ALIGNMENT_PATTERNS = [
        1 => [],
        2 => [6, 18],
        3 => [6, 22],
        4 => [6, 26],
        5 => [6, 30],
        6 => [6, 34],
        7 => [6, 22, 38],
        8 => [6, 24, 42],
        9 => [6, 26, 46],
        10 => [6, 28, 50],
    ];

    /**
     * Standard ISO/IEC 18004 Table 9 (Error Correction Codewords & Blocks)
     */
    private static array $ISO_RS_BLOCKS = [
        // Version 1
        '1:L' => [['count' => 1, 'totalCount' => 26, 'dataCount' => 19]],
        '1:M' => [['count' => 1, 'totalCount' => 26, 'dataCount' => 16]],
        '1:Q' => [['count' => 1, 'totalCount' => 26, 'dataCount' => 13]],
        '1:H' => [['count' => 1, 'totalCount' => 26, 'dataCount' => 9]],
        // Version 2
        '2:L' => [['count' => 1, 'totalCount' => 44, 'dataCount' => 34]],
        '2:M' => [['count' => 1, 'totalCount' => 44, 'dataCount' => 28]],
        '2:Q' => [['count' => 1, 'totalCount' => 44, 'dataCount' => 22]],
        '2:H' => [['count' => 1, 'totalCount' => 44, 'dataCount' => 16]],
        // Version 3
        '3:L' => [['count' => 1, 'totalCount' => 70, 'dataCount' => 55]],
        '3:M' => [['count' => 1, 'totalCount' => 70, 'dataCount' => 44]],
        '3:Q' => [['count' => 2, 'totalCount' => 35, 'dataCount' => 17]],
        '3:H' => [['count' => 2, 'totalCount' => 35, 'dataCount' => 13]],
        // Version 4
        '4:L' => [['count' => 1, 'totalCount' => 100, 'dataCount' => 80]],
        '4:M' => [['count' => 2, 'totalCount' => 50, 'dataCount' => 32]],
        '4:Q' => [['count' => 2, 'totalCount' => 50, 'dataCount' => 24]],
        '4:H' => [['count' => 4, 'totalCount' => 25, 'dataCount' => 9]],
        // Version 5
        '5:L' => [['count' => 1, 'totalCount' => 134, 'dataCount' => 108]],
        '5:M' => [['count' => 2, 'totalCount' => 67, 'dataCount' => 43]],
        '5:Q' => [['count' => 2, 'totalCount' => 33, 'dataCount' => 15], ['count' => 2, 'totalCount' => 34, 'dataCount' => 16]],
        '5:H' => [['count' => 2, 'totalCount' => 33, 'dataCount' => 11], ['count' => 2, 'totalCount' => 34, 'dataCount' => 12]],
        // Version 6
        '6:L' => [['count' => 2, 'totalCount' => 86, 'dataCount' => 68]],
        '6:M' => [['count' => 4, 'totalCount' => 43, 'dataCount' => 27]],
        '6:Q' => [['count' => 4, 'totalCount' => 43, 'dataCount' => 19]],
        '6:H' => [['count' => 4, 'totalCount' => 43, 'dataCount' => 15]],
        // Version 7
        '7:L' => [['count' => 2, 'totalCount' => 98, 'dataCount' => 78]],
        '7:M' => [['count' => 4, 'totalCount' => 49, 'dataCount' => 31]],
        '7:Q' => [['count' => 2, 'totalCount' => 32, 'dataCount' => 14], ['count' => 4, 'totalCount' => 33, 'dataCount' => 15]],
        '7:H' => [['count' => 4, 'totalCount' => 39, 'dataCount' => 13], ['count' => 1, 'totalCount' => 40, 'dataCount' => 14]],
        // Version 8
        '8:L' => [['count' => 2, 'totalCount' => 121, 'dataCount' => 97]],
        '8:M' => [['count' => 2, 'totalCount' => 60, 'dataCount' => 38], ['count' => 2, 'totalCount' => 61, 'dataCount' => 39]],
        '8:Q' => [['count' => 4, 'totalCount' => 40, 'dataCount' => 18], ['count' => 2, 'totalCount' => 41, 'dataCount' => 19]],
        '8:H' => [['count' => 4, 'totalCount' => 40, 'dataCount' => 14], ['count' => 2, 'totalCount' => 41, 'dataCount' => 15]],
        // Version 9
        '9:L' => [['count' => 2, 'totalCount' => 146, 'dataCount' => 116]],
        '9:M' => [['count' => 3, 'totalCount' => 58, 'dataCount' => 36], ['count' => 2, 'totalCount' => 59, 'dataCount' => 37]],
        '9:Q' => [['count' => 4, 'totalCount' => 36, 'dataCount' => 16], ['count' => 4, 'totalCount' => 37, 'dataCount' => 17]],
        '9:H' => [['count' => 4, 'totalCount' => 36, 'dataCount' => 12], ['count' => 4, 'totalCount' => 37, 'dataCount' => 13]],
        // Version 10
        '10:L' => [['count' => 2, 'totalCount' => 86, 'dataCount' => 68], ['count' => 2, 'totalCount' => 87, 'dataCount' => 69]],
        '10:M' => [['count' => 4, 'totalCount' => 69, 'dataCount' => 43], ['count' => 1, 'totalCount' => 70, 'dataCount' => 44]],
        '10:Q' => [['count' => 6, 'totalCount' => 43, 'dataCount' => 19], ['count' => 2, 'totalCount' => 44, 'dataCount' => 20]],
        '10:H' => [['count' => 6, 'totalCount' => 43, 'dataCount' => 15], ['count' => 2, 'totalCount' => 44, 'dataCount' => 16]],
    ];

    private static function initGaloisField(): void
    {
        if (self::$EXP_TABLE !== null) {
            return;
        }

        self::$EXP_TABLE = array_fill(0, 512, 0);
        self::$LOG_TABLE = array_fill(0, 256, 0);

        $x = 1;
        for ($i = 0; $i < 255; $i++) {
            self::$EXP_TABLE[$i] = $x;
            self::$LOG_TABLE[$x] = $i;
            $x <<= 1;
            if ($x & 256) {
                $x ^= 285; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
            }
        }
        for ($i = 255; $i < 512; $i++) {
            self::$EXP_TABLE[$i] = self::$EXP_TABLE[$i - 255];
        }
    }

    private static function gfMul(int $x, int $y): int
    {
        if ($x === 0 || $y === 0) {
            return 0;
        }
        self::initGaloisField();
        return self::$EXP_TABLE[self::$LOG_TABLE[$x] + self::$LOG_TABLE[$y]];
    }

    private static function gfInv(int $x): int
    {
        if ($x === 0) {
            throw new InvalidArgumentException("Division by zero in GF(2^8)");
        }
        self::initGaloisField();
        return self::$EXP_TABLE[255 - self::$LOG_TABLE[$x]];
    }

    /**
     * Resolves standard RS block structure for given QR version and EC level.
     *
     * @return array<int, array{totalCount: int, dataCount: int}>
     */
    public static function getBlockList(int $version, string $ecLevel): array
    {
        $key = "{$version}:{$ecLevel}";
        $entries = self::$ISO_RS_BLOCKS[$key] ?? self::$ISO_RS_BLOCKS['1:M'];
        $blocks = [];
        foreach ($entries as $entry) {
            for ($i = 0; $i < $entry['count']; $i++) {
                $blocks[] = [
                    'totalCount' => $entry['totalCount'],
                    'dataCount' => $entry['dataCount']
                ];
            }
        }
        return $blocks;
    }

    /**
     * Calculates Reed-Solomon syndromes for a codeword block.
     *
     * @param int[] $codeword Full codeword (data + ec)
     * @param int $numEc Number of error correction codewords
     * @return int[]
     */
    public static function calculateSyndromes(array $codeword, int $numEc): array
    {
        self::initGaloisField();
        $syndromes = [];
        for ($i = 0; $i < $numEc; $i++) {
            $alpha_i = self::$EXP_TABLE[$i];
            $val = 0;
            foreach ($codeword as $c) {
                $val = self::gfMul($val, $alpha_i) ^ $c;
            }
            $syndromes[] = $val;
        }
        return $syndromes;
    }

    /**
     * Performs algebraic Reed-Solomon error correction on a codeword block.
     * Uses Berlekamp-Massey for error locator, Chien search for error roots,
     * and Forney's algorithm for error values.
     *
     * @param int[] $codeword Received codeword (data + ec)
     * @param int $numEc Number of EC codewords
     * @return int[] Corrected codeword
     */
    public static function correctErrors(array $codeword, int $numEc): array
    {
        self::initGaloisField();
        $syndromes = self::calculateSyndromes($codeword, $numEc);

        $hasError = false;
        foreach ($syndromes as $s) {
            if ($s !== 0) {
                $hasError = true;
                break;
            }
        }

        if (!$hasError) {
            return $codeword;
        }

        $n = count($codeword);
        $maxErrors = (int)floor($numEc / 2);

        // 1. Berlekamp-Massey algorithm
        $C = [1];
        $B = [1];
        $L = 0;
        $m = 1;
        $b = 1;

        for ($k = 0; $k < $numEc; $k++) {
            $delta = $syndromes[$k];
            for ($i = 1; $i <= $L; $i++) {
                $delta ^= self::gfMul($C[$i], $syndromes[$k - $i]);
            }

            if ($delta === 0) {
                $m++;
            } else {
                $T = $C;
                $factor = self::gfMul($delta, self::gfInv($b));
                $shiftedB = array_merge(array_fill(0, $m, 0), $B);
                $len = max(count($C), count($shiftedB));
                $newC = array_fill(0, $len, 0);
                for ($i = 0; $i < count($C); $i++) {
                    $newC[$i] ^= $C[$i];
                }
                for ($i = 0; $i < count($shiftedB); $i++) {
                    $newC[$i] ^= self::gfMul($factor, $shiftedB[$i]);
                }
                $C = $newC;

                if (2 * $L <= $k) {
                    $L = $k + 1 - $L;
                    $B = $T;
                    $b = $delta;
                    $m = 1;
                } else {
                    $m++;
                }
            }
        }

        if ($L > $maxErrors) {
            throw new RuntimeException("Uncorrectable Reed-Solomon errors: error count ({$L}) exceeds capacity ({$maxErrors})");
        }

        // 2. Chien search for error roots
        $errPos = [];
        for ($pos = 0; $pos < $n; $pos++) {
            $p = ($n - 1 - $pos) % 255;
            $eval = 1;
            for ($i = 1; $i <= $L; $i++) {
                $term = ($p * $i) % 255;
                $eval ^= self::gfMul($C[$i], self::$EXP_TABLE[(255 - $term) % 255]);
            }
            if ($eval === 0) {
                $errPos[] = $pos;
            }
        }

        if (count($errPos) !== $L) {
            throw new RuntimeException("Uncorrectable Reed-Solomon errors: could not resolve roots for error locator polynomial");
        }

        // 3. Forney's algorithm for error values
        // Evaluator polynomial Omega(x) = (S(x) * C(x)) mod x^numEc
        $omega = array_fill(0, $numEc, 0);
        for ($i = 0; $i < $numEc; $i++) {
            for ($j = 0; $j <= $L && ($i + $j) < $numEc; $j++) {
                $omega[$i + $j] ^= self::gfMul($syndromes[$i], $C[$j]);
            }
        }

        $corrected = $codeword;
        foreach ($errPos as $pos) {
            $p = ($n - 1 - $pos) % 255;
            $xInv = self::$EXP_TABLE[(255 - $p) % 255];
            $xVal = self::$EXP_TABLE[$p];

            // Evaluate Omega(xInv)
            $omegaVal = 0;
            $xPow = 1;
            for ($i = 0; $i < $numEc; $i++) {
                $omegaVal ^= self::gfMul($omega[$i], $xPow);
                $xPow = self::gfMul($xPow, $xInv);
            }

            // Formal derivative C'(xInv)
            $cPrimeVal = 0;
            for ($i = 1; $i <= $L; $i += 2) {
                $cPrimeVal ^= self::gfMul($C[$i], self::$EXP_TABLE[((255 - $p) * ($i - 1)) % 255]);
            }

            if ($cPrimeVal === 0) {
                throw new RuntimeException("Reed-Solomon denominator zero in Forney algorithm");
            }

            // Forney formula with starting exponent b = 0: Y_k = X_k * Omega(X_k^{-1}) / C'(X_k^{-1})
            $errVal = self::gfMul($xVal, self::gfMul($omegaVal, self::gfInv($cPrimeVal)));
            $corrected[$pos] ^= $errVal;
        }

        // Verify corrected syndromes evaluate to zero
        $verifySyndromes = self::calculateSyndromes($corrected, $numEc);
        foreach ($verifySyndromes as $vs) {
            if ($vs !== 0) {
                throw new RuntimeException("Reed-Solomon verification failed: syndromes remain non-zero after correction");
            }
        }

        return $corrected;
    }

    /**
     * Extracts block codewords and returns syndrome arrays for all blocks.
     *
     * @return array<int, int[]>
     */
    public static function extractBlockSyndromes(array $matrix): array
    {
        $blocks = self::extractCodewordBlocks($matrix);
        $result = [];
        foreach ($blocks as $b) {
            $ecCount = count($b['ec']);
            $fullCodeword = array_merge($b['data'], $b['ec']);
            $result[] = self::calculateSyndromes($fullCodeword, $ecCount);
        }
        return $result;
    }

    /**
     * Extracts data and EC codeword blocks from a QR code boolean matrix.
     *
     * @return array<int, array{data: int[], ec: int[], version: int, ecLevel: string}>
     */
    public static function extractCodewordBlocks(array $matrix): array
    {
        $size = count($matrix);
        if ($size < 21 || ($size - 17) % 4 !== 0) {
            throw new InvalidArgumentException("Invalid QR matrix size: {$size}");
        }

        $version = (int)(($size - 17) / 4);
        if ($version < 1 || $version > 10) {
            throw new InvalidArgumentException("Unsupported QR version: {$version}");
        }

        // 1. Read Vertical Format Information (15 bits)
        $bits = 0;
        for ($i = 0; $i < 15; $i++) {
            if ($i < 6) {
                $val = !empty($matrix[$i][8]);
            } elseif ($i < 8) {
                $val = !empty($matrix[$i + 1][8]);
            } else {
                $val = !empty($matrix[$size - 15 + $i][8]);
            }
            if ($val) {
                $bits |= (1 << $i);
            }
        }

        $unmaskedFormat = $bits ^ self::G15_MASK;
        $typeData = ($unmaskedFormat >> 10) & 0x1F;
        $ecIndicator = ($typeData >> 3) & 0x03;
        $maskPattern = $typeData & 0x07;

        $ecLevel = match ($ecIndicator) {
            1 => 'L',
            0 => 'M',
            3 => 'Q',
            2 => 'H',
            default => 'M'
        };

        // 2. Build Functional Modules Map
        $isFunction = array_fill(0, $size, array_fill(0, $size, false));

        // Mark Finder Patterns & Separators (8x8 areas)
        for ($r = 0; $r < 9; $r++) {
            for ($c = 0; $c < 9; $c++) {
                $isFunction[$r][$c] = true;
            }
        }
        for ($r = 0; $r < 9; $r++) {
            for ($c = $size - 8; $c < $size; $c++) {
                $isFunction[$r][$c] = true;
            }
        }
        for ($r = $size - 8; $r < $size; $r++) {
            for ($c = 0; $c < 9; $c++) {
                $isFunction[$r][$c] = true;
            }
        }

        // Dark module
        $isFunction[$size - 8][8] = true;

        // Timing patterns
        for ($i = 0; $i < $size; $i++) {
            $isFunction[6][$i] = true;
            $isFunction[$i][6] = true;
        }

        // Format info around other finders
        for ($i = 0; $i < 8; $i++) {
            $isFunction[8][$size - 1 - $i] = true;
            $isFunction[$size - 1 - $i][8] = true;
        }

        // Alignment patterns
        $alignPos = self::$ALIGNMENT_PATTERNS[$version] ?? [];
        $numPos = count($alignPos);
        for ($i = 0; $i < $numPos; $i++) {
            for ($j = 0; $j < $numPos; $j++) {
                $row = $alignPos[$i];
                $col = $alignPos[$j];

                if (($row === 6 && $col === 6) ||
                    ($row === 6 && $col === $size - 7) ||
                    ($row === $size - 7 && $col === 6)) {
                    continue;
                }

                for ($r = -2; $r <= 2; $r++) {
                    for ($c = -2; $c <= 2; $c++) {
                        $isFunction[$row + $r][$col + $c] = true;
                    }
                }
            }
        }

        // Version Information (18 bits) for versions >= 7
        if ($version >= 7) {
            for ($i = 0; $i < 18; $i++) {
                $r1 = (int) floor($i / 3);
                $c1 = ($i % 3) + $size - 8 - 3;
                $isFunction[$r1][$c1] = true;

                $r2 = ($i % 3) + $size - 8 - 3;
                $c2 = (int) floor($i / 3);
                $isFunction[$r2][$c2] = true;
            }
        }

        // 3. Unmask Data Modules
        $maskFunc = match ($maskPattern) {
            0 => fn(int $i, int $j): bool => ($i + $j) % 2 === 0,
            1 => fn(int $i, int $j): bool => $i % 2 === 0,
            2 => fn(int $i, int $j): bool => $j % 3 === 0,
            3 => fn(int $i, int $j): bool => ($i + $j) % 3 === 0,
            4 => fn(int $i, int $j): bool => ((int)floor($i / 2) + (int)floor($j / 3)) % 2 === 0,
            5 => fn(int $i, int $j): bool => ($i * $j) % 2 + ($i * $j) % 3 === 0,
            6 => fn(int $i, int $j): bool => (($i * $j) % 2 + ($i * $j) % 3) % 2 === 0,
            7 => fn(int $i, int $j): bool => (($i * $j) % 3 + ($i + $j) % 2) % 2 === 0,
            default => fn(int $i, int $j): bool => false
        };

        // 4. Read Data Bits in Zig-Zag Pattern
        $rawBits = '';
        $dir = -1;
        $row = $size - 1;

        for ($col = $size - 1; $col > 0; $col -= 2) {
            if ($col === 6) {
                $col--;
            }

            while (true) {
                for ($c = 0; $c < 2; $c++) {
                    $currCol = $col - $c;
                    if (!$isFunction[$row][$currCol]) {
                        $isDark = !empty($matrix[$row][$currCol]);
                        if ($maskFunc($row, $currCol)) {
                            $isDark = !$isDark;
                        }
                        $rawBits .= $isDark ? '1' : '0';
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

        // 5. Convert Raw Bits to Codewords
        $rawBytes = [];
        $bitCount = strlen($rawBits);
        for ($i = 0; $i + 8 <= $bitCount; $i += 8) {
            $rawBytes[] = bindec(substr($rawBits, $i, 8));
        }

        // 6. De-interleave Data Codewords and EC Codewords
        $rsBlocks = self::getBlockList($version, $ecLevel);
        $numBlocks = count($rsBlocks);
        $maxDataCount = 0;
        foreach ($rsBlocks as $b) {
            $maxDataCount = max($maxDataCount, $b['dataCount']);
        }

        $blockData = array_fill(0, $numBlocks, []);
        $byteIndex = 0;

        // Data codewords de-interleaving
        for ($i = 0; $i < $maxDataCount; $i++) {
            for ($b = 0; $b < $numBlocks; $b++) {
                if ($i < $rsBlocks[$b]['dataCount']) {
                    if ($byteIndex < count($rawBytes)) {
                        $blockData[$b][] = $rawBytes[$byteIndex++];
                    }
                }
            }
        }

        // EC codewords de-interleaving
        $ecCount = $rsBlocks[0]['totalCount'] - $rsBlocks[0]['dataCount'];
        $blockEc = array_fill(0, $numBlocks, []);
        for ($i = 0; $i < $ecCount; $i++) {
            for ($b = 0; $b < $numBlocks; $b++) {
                if ($byteIndex < count($rawBytes)) {
                    $blockEc[$b][] = $rawBytes[$byteIndex++];
                }
            }
        }

        $result = [];
        for ($b = 0; $b < $numBlocks; $b++) {
            $result[] = [
                'data' => $blockData[$b],
                'ec' => $blockEc[$b],
                'version' => $version,
                'ecLevel' => $ecLevel
            ];
        }

        return $result;
    }

    /**
     * Decodes a QR code boolean matrix (true = dark, false = light).
     * Automatically corrects corrupted modules/codewords using Reed-Solomon ECC.
     */
    public static function decodeMatrix(array $matrix): string
    {
        $blocks = self::extractCodewordBlocks($matrix);
        $version = $blocks[0]['version'];

        $correctedDataCodewords = [];
        foreach ($blocks as $block) {
            $ecCount = count($block['ec']);
            $fullCodeword = array_merge($block['data'], $block['ec']);

            // Algebraic Reed-Solomon error correction
            $correctedFull = self::correctErrors($fullCodeword, $ecCount);
            $dataCount = count($block['data']);
            $dataPart = array_slice($correctedFull, 0, $dataCount);

            foreach ($dataPart as $byte) {
                $correctedDataCodewords[] = $byte;
            }
        }

        // Parse Data Bitstream (Byte Mode: 0100)
        $dataBits = '';
        foreach ($correctedDataCodewords as $byteVal) {
            $dataBits .= str_pad(decbin($byteVal), 8, '0', STR_PAD_LEFT);
        }

        if (strlen($dataBits) < 4) {
            throw new RuntimeException("Truncated QR bitstream");
        }

        $mode = substr($dataBits, 0, 4);
        if ($mode !== '0100') {
            throw new RuntimeException("Unsupported QR mode '{$mode}' (expected 0100 for 8-bit byte mode)");
        }

        $charCountLen = ($version < 10) ? 8 : 16;
        $charCount = bindec(substr($dataBits, 4, $charCountLen));
        $offset = 4 + $charCountLen;

        $chars = [];
        for ($i = 0; $i < $charCount; $i++) {
            $byteStr = substr($dataBits, $offset + ($i * 8), 8);
            if (strlen($byteStr) === 8) {
                $chars[] = bindec($byteStr);
            }
        }

        return pack('C*', ...$chars);
    }
}
