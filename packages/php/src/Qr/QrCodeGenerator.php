<?php

declare(strict_types=1);

namespace Omnicode\Qr;

use InvalidArgumentException;
use LengthException;
use Omnicode\Security\ColorSanitizer;

/**
 * Enterprise Pure PHP QR Code Generator (ISO/IEC 18004 compliant).
 * 
 * Features:
 * - Reed-Solomon Error Correction in GF(256)
 * - Standard multi-block codeword interleaving
 * - Optimal mask evaluation (0-7) via ISO/IEC 18004 penalty scoring
 * - 15-bit Format Information (BCH 15,5 with G15/G15_MASK)
 * - 18-bit Version Information (BCH 18,6 for v7+)
 * - Standard Alignment Pattern tables (Versions 1-10)
 * - Quiet Separator around Finder Patterns
 * - Vector SVG output with linear/radial gradients, custom dots, and secure logo embedding
 */
class QrCodeGenerator
{
    private const PAD0 = 0xEC;
    private const PAD1 = 0x11;

    private const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    private const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
    private const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);

    private static array $EXP_TABLE = [];
    private static array $LOG_TABLE = [];

    /**
     * Initializes Galois Field tables GF(256) with primitive polynomial x^8 + x^4 + x^3 + x^2 + 1.
     */
    private static function initMath(): void
    {
        if (!empty(self::$EXP_TABLE)) {
            return;
        }
        self::$EXP_TABLE = array_fill(0, 256, 0);
        self::$LOG_TABLE = array_fill(0, 256, 0);

        for ($i = 0; $i < 8; $i++) {
            self::$EXP_TABLE[$i] = 1 << $i;
        }
        for ($i = 8; $i < 256; $i++) {
            self::$EXP_TABLE[$i] = self::$EXP_TABLE[$i - 4]
                ^ self::$EXP_TABLE[$i - 5]
                ^ self::$EXP_TABLE[$i - 6]
                ^ self::$EXP_TABLE[$i - 8];
        }
        for ($i = 0; $i < 255; $i++) {
            self::$LOG_TABLE[self::$EXP_TABLE[$i]] = $i;
        }
    }

    private static function glog(int $n): int
    {
        if ($n < 1) {
            throw new InvalidArgumentException("glog($n)");
        }
        return self::$LOG_TABLE[$n];
    }

    private static function gexp(int $n): int
    {
        while ($n < 0) {
            $n += 255;
        }
        while ($n >= 256) {
            $n -= 255;
        }
        return self::$EXP_TABLE[$n];
    }

    private static function polyMultiply(array $p1, array $p2): array
    {
        $len1 = count($p1);
        $len2 = count($p2);
        $res = array_fill(0, $len1 + $len2 - 1, 0);
        for ($i = 0; $i < $len1; $i++) {
            for ($j = 0; $j < $len2; $j++) {
                $res[$i + $j] ^= self::gexp(self::glog($p1[$i]) + self::glog($p2[$j]));
            }
        }
        return $res;
    }

    private static function polyMod(array $num, array $e): array
    {
        while (!empty($num) && $num[0] === 0) {
            array_shift($num);
        }
        if (count($num) < count($e)) {
            return $num;
        }
        $ratio = self::glog($num[0]) - self::glog($e[0]);
        for ($i = 0; $i < count($e); $i++) {
            $num[$i] ^= self::gexp(self::glog($e[$i]) + $ratio);
        }
        return self::polyMod($num, $e);
    }

    private static function getErrorCorrectPolynomial(int $errorCorrectLength): array
    {
        $a = [1];
        for ($i = 0; $i < $errorCorrectLength; $i++) {
            $a = self::polyMultiply($a, [1, self::gexp($i)]);
        }
        return $a;
    }

    private static function getBCHDigit(int $data): int
    {
        $digit = 0;
        while ($data != 0) {
            $digit++;
            $data >>= 1;
        }
        return $digit;
    }

    private static function getBCHTypeInfo(int $data): int
    {
        $d = $data << 10;
        while (self::getBCHDigit($d) - self::getBCHDigit(self::G15) >= 0) {
            $d ^= (self::G15 << (self::getBCHDigit($d) - self::getBCHDigit(self::G15)));
        }
        return (($data << 10) | $d) ^ self::G15_MASK;
    }

    private static function getBCHTypeNumber(int $data): int
    {
        $d = $data << 12;
        while (self::getBCHDigit($d) - self::getBCHDigit(self::G18) >= 0) {
            $d ^= (self::G18 << (self::getBCHDigit($d) - self::getBCHDigit(self::G18)));
        }
        return ($data << 12) | $d;
    }

    /**
     * Standard ISO 18004 RS Block Table per version & ECC level (L, M, Q, H).
     */
    public static function getRSBlocks(int $version, string $ecLevel): array
    {
        $table = [
            // 1
            '1:L' => [[1, 26, 19]],
            '1:M' => [[1, 26, 16]],
            '1:Q' => [[1, 26, 13]],
            '1:H' => [[1, 26, 9]],
            // 2
            '2:L' => [[1, 44, 34]],
            '2:M' => [[1, 44, 28]],
            '2:Q' => [[1, 44, 22]],
            '2:H' => [[1, 44, 16]],
            // 3
            '3:L' => [[1, 70, 55]],
            '3:M' => [[1, 70, 44]],
            '3:Q' => [[2, 35, 17]],
            '3:H' => [[2, 35, 13]],
            // 4
            '4:L' => [[1, 100, 80]],
            '4:M' => [[2, 50, 32]],
            '4:Q' => [[2, 50, 24]],
            '4:H' => [[4, 25, 9]],
            // 5
            '5:L' => [[1, 134, 108]],
            '5:M' => [[2, 67, 43]],
            '5:Q' => [[2, 33, 15], [2, 34, 16]],
            '5:H' => [[2, 33, 11], [2, 34, 12]],
            // 6
            '6:L' => [[2, 86, 68]],
            '6:M' => [[4, 43, 27]],
            '6:Q' => [[4, 43, 19]],
            '6:H' => [[4, 43, 15]],
            // 7
            '7:L' => [[2, 98, 78]],
            '7:M' => [[4, 49, 31]],
            '7:Q' => [[2, 32, 14], [4, 33, 15]],
            '7:H' => [[4, 39, 13], [1, 40, 14]],
            // 8
            '8:L' => [[2, 121, 97]],
            '8:M' => [[2, 60, 38], [2, 61, 39]],
            '8:Q' => [[4, 40, 18], [2, 41, 19]],
            '8:H' => [[4, 40, 14], [2, 41, 15]],
            // 9
            '9:L' => [[2, 146, 116]],
            '9:M' => [[3, 58, 36], [2, 59, 37]],
            '9:Q' => [[4, 36, 16], [4, 37, 17]],
            '9:H' => [[4, 36, 12], [4, 37, 13]],
            // 10
            '10:L' => [[2, 86, 68], [2, 87, 69]],
            '10:M' => [[4, 69, 43], [1, 70, 44]],
            '10:Q' => [[6, 43, 19], [2, 44, 20]],
            '10:H' => [[6, 43, 15], [2, 44, 16]],
        ];

        $key = "$version:$ecLevel";
        $list = $table[$key] ?? $table['1:M'];
        $blocks = [];
        foreach ($list as $entry) {
            $count = $entry[0];
            $totalCount = $entry[1];
            $dataCount = $entry[2];
            for ($i = 0; $i < $count; $i++) {
                $blocks[] = ['totalCount' => $totalCount, 'dataCount' => $dataCount];
            }
        }
        return $blocks;
    }

    private static function getAlignmentPatternPositions(int $version): array
    {
        $table = [
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
        return $table[$version] ?? [];
    }

    private static function determineVersion(int $byteLen, string $ecLevel): int
    {
        for ($v = 1; $v <= 10; $v++) {
            $charCountBits = ($v < 10) ? 8 : 16;
            $totalBitsNeeded = 4 + $charCountBits + ($byteLen * 8);
            $rsBlocks = self::getRSBlocks($v, $ecLevel);
            $totalDataCount = 0;
            foreach ($rsBlocks as $b) {
                $totalDataCount += $b['dataCount'];
            }
            if ($totalBitsNeeded <= $totalDataCount * 8) {
                return $v;
            }
        }

        $maxBlocks = self::getRSBlocks(10, $ecLevel);
        $maxCapacity = 0;
        foreach ($maxBlocks as $b) {
            $maxCapacity += $b['dataCount'];
        }
        $maxPayloadBytes = $maxCapacity - 3; // 4 bits mode + 16 bits length

        throw new LengthException(
            "Payload length ({$byteLen} bytes) exceeds maximum QR Code capacity ({$maxPayloadBytes} bytes) for error correction level '{$ecLevel}'."
        );
    }

    /**
     * Builds data bitstream, performs block partitioning, calculates RS EC, and interleaves.
     *
     * @return array<int, int> Array of interleaved 8-bit codewords
     */
    private static function createCodewords(string $data, int $version, string $ecLevel): array
    {
        self::initMath();
        $rsBlocks = self::getRSBlocks($version, $ecLevel);

        $totalDataCount = 0;
        foreach ($rsBlocks as $b) {
            $totalDataCount += $b['dataCount'];
        }

        // Byte Mode = 0100
        $dataBytes = array_values(unpack('C*', $data));
        $charCountBits = ($version < 10) ? 8 : 16;

        $bits = '0100';
        $bits .= str_pad(decbin(count($dataBytes)), $charCountBits, '0', STR_PAD_LEFT);
        foreach ($dataBytes as $b) {
            $bits .= str_pad(decbin($b), 8, '0', STR_PAD_LEFT);
        }

        // Terminator (up to 4 bits)
        if (strlen($bits) + 4 <= $totalDataCount * 8) {
            $bits .= '0000';
        }

        // Byte boundary padding
        while (strlen($bits) % 8 !== 0) {
            $bits .= '0';
        }

        // Fill pad bytes (0xEC, 0x11)
        $rawBytes = [];
        for ($i = 0; $i < strlen($bits); $i += 8) {
            $rawBytes[] = bindec(substr($bits, $i, 8));
        }

        while (count($rawBytes) < $totalDataCount) {
            $rawBytes[] = self::PAD0;
            if (count($rawBytes) < $totalDataCount) {
                $rawBytes[] = self::PAD1;
            }
        }

        // Compute RS error correction per block
        $offset = 0;
        $maxDcCount = 0;
        $maxEcCount = 0;
        $dcdata = [];
        $ecdata = [];

        foreach ($rsBlocks as $r => $b) {
            $dcCount = $b['dataCount'];
            $ecCount = $b['totalCount'] - $dcCount;

            $maxDcCount = max($maxDcCount, $dcCount);
            $maxEcCount = max($maxEcCount, $ecCount);

            $dcdata[$r] = array_slice($rawBytes, $offset, $dcCount);
            $offset += $dcCount;

            $rsPoly = self::getErrorCorrectPolynomial($ecCount);
            $rawPoly = array_merge($dcdata[$r], array_fill(0, count($rsPoly) - 1, 0));
            $modPoly = self::polyMod($rawPoly, $rsPoly);

            $ecBlock = array_fill(0, count($rsPoly) - 1, 0);
            $ecLen = count($ecBlock);
            $modLen = count($modPoly);
            for ($i = 0; $i < $ecLen; $i++) {
                $modIndex = $i + $modLen - $ecLen;
                $ecBlock[$i] = ($modIndex >= 0) ? $modPoly[$modIndex] : 0;
            }
            $ecdata[$r] = $ecBlock;
        }

        // Interleave DC and EC codewords
        $totalCodeCount = 0;
        foreach ($rsBlocks as $b) {
            $totalCodeCount += $b['totalCount'];
        }

        $result = array_fill(0, $totalCodeCount, 0);
        $index = 0;

        for ($i = 0; $i < $maxDcCount; $i++) {
            for ($r = 0; $r < count($rsBlocks); $r++) {
                if ($i < count($dcdata[$r])) {
                    $result[$index++] = $dcdata[$r][$i];
                }
            }
        }

        for ($i = 0; $i < $maxEcCount; $i++) {
            for ($r = 0; $r < count($rsBlocks); $r++) {
                if ($i < count($ecdata[$r])) {
                    $result[$index++] = $ecdata[$r][$i];
                }
            }
        }

        return $result;
    }

    private static function getMaskFunction(int $maskPattern): \Closure
    {
        switch ($maskPattern) {
            case 0: return fn(int $i, int $j) => ($i + $j) % 2 === 0;
            case 1: return fn(int $i, int $j) => $i % 2 === 0;
            case 2: return fn(int $i, int $j) => $j % 3 === 0;
            case 3: return fn(int $i, int $j) => ($i + $j) % 3 === 0;
            case 4: return fn(int $i, int $j) => ((int) floor($i / 2) + (int) floor($j / 3)) % 2 === 0;
            case 5: return fn(int $i, int $j) => (($i * $j) % 2 + ($i * $j) % 3) === 0;
            case 6: return fn(int $i, int $j) => ((($i * $j) % 2 + ($i * $j) % 3) % 2) === 0;
            case 7: return fn(int $i, int $j) => ((($i * $j) % 3 + ($i + $j) % 2) % 2) === 0;
            default: return fn(int $i, int $j) => ($i + $j) % 2 === 0;
        }
    }

    /**
     * Evaluates matrix penalty score using all 4 ISO/IEC 18004 rules.
     */
    public static function evaluateLostPoints(array $matrix): int
    {
        $size = count($matrix);
        $lostPoint = 0;

        // Rule 1 (N1 = 3): 5 or more consecutive modules of identical color in row/column
        for ($r = 0; $r < $size; $r++) {
            $currentColor = $matrix[$r][0];
            $currentRun = 1;
            for ($c = 1; $c < $size; $c++) {
                if ($matrix[$r][$c] === $currentColor) {
                    $currentRun++;
                } else {
                    if ($currentRun >= 5) {
                        $lostPoint += 3 + ($currentRun - 5);
                    }
                    $currentColor = $matrix[$r][$c];
                    $currentRun = 1;
                }
            }
            if ($currentRun >= 5) {
                $lostPoint += 3 + ($currentRun - 5);
            }
        }

        for ($c = 0; $c < $size; $c++) {
            $currentColor = $matrix[0][$c];
            $currentRun = 1;
            for ($r = 1; $r < $size; $r++) {
                if ($matrix[$r][$c] === $currentColor) {
                    $currentRun++;
                } else {
                    if ($currentRun >= 5) {
                        $lostPoint += 3 + ($currentRun - 5);
                    }
                    $currentColor = $matrix[$r][$c];
                    $currentRun = 1;
                }
            }
            if ($currentRun >= 5) {
                $lostPoint += 3 + ($currentRun - 5);
            }
        }

        // Rule 2 (N2 = 3): 2x2 blocks of same color
        for ($r = 0; $r < $size - 1; $r++) {
            for ($c = 0; $c < $size - 1; $c++) {
                $color = $matrix[$r][$c];
                if (
                    $color === $matrix[$r][$c + 1] &&
                    $color === $matrix[$r + 1][$c] &&
                    $color === $matrix[$r + 1][$c + 1]
                ) {
                    $lostPoint += 3;
                }
            }
        }

        // Rule 3 (N3 = 40): 1:1:3:1:1 pattern with 4 preceding or trailing light modules
        // Patterns: 0 0 0 0 1 0 1 1 1 0 1 (11 modules) or 1 0 1 1 1 0 1 0 0 0 0 (11 modules)
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c <= $size - 11; $c++) {
                if (
                    $matrix[$r][$c + 4] &&
                    !$matrix[$r][$c + 5] &&
                    $matrix[$r][$c + 6] &&
                    $matrix[$r][$c + 7] &&
                    $matrix[$r][$c + 8] &&
                    !$matrix[$r][$c + 9] &&
                    $matrix[$r][$c + 10]
                ) {
                    if (
                        !$matrix[$r][$c] &&
                        !$matrix[$r][$c + 1] &&
                        !$matrix[$r][$c + 2] &&
                        !$matrix[$r][$c + 3]
                    ) {
                        $lostPoint += 40;
                    }
                }

                if (
                    $matrix[$r][$c] &&
                    !$matrix[$r][$c + 1] &&
                    $matrix[$r][$c + 2] &&
                    $matrix[$r][$c + 3] &&
                    $matrix[$r][$c + 4] &&
                    !$matrix[$r][$c + 5] &&
                    $matrix[$r][$c + 6]
                ) {
                    if (
                        !$matrix[$r][$c + 7] &&
                        !$matrix[$r][$c + 8] &&
                        !$matrix[$r][$c + 9] &&
                        !$matrix[$r][$c + 10]
                    ) {
                        $lostPoint += 40;
                    }
                }
            }
        }

        for ($c = 0; $c < $size; $c++) {
            for ($r = 0; $r <= $size - 11; $r++) {
                if (
                    $matrix[$r + 4][$c] &&
                    !$matrix[$r + 5][$c] &&
                    $matrix[$r + 6][$c] &&
                    $matrix[$r + 7][$c] &&
                    $matrix[$r + 8][$c] &&
                    !$matrix[$r + 9][$c] &&
                    $matrix[$r + 10][$c]
                ) {
                    if (
                        !$matrix[$r][$c] &&
                        !$matrix[$r + 1][$c] &&
                        !$matrix[$r + 2][$c] &&
                        !$matrix[$r + 3][$c]
                    ) {
                        $lostPoint += 40;
                    }
                }

                if (
                    $matrix[$r][$c] &&
                    !$matrix[$r + 1][$c] &&
                    $matrix[$r + 2][$c] &&
                    $matrix[$r + 3][$c] &&
                    $matrix[$r + 4][$c] &&
                    !$matrix[$r + 5][$c] &&
                    $matrix[$r + 6][$c]
                ) {
                    if (
                        !$matrix[$r + 7][$c] &&
                        !$matrix[$r + 8][$c] &&
                        !$matrix[$r + 9][$c] &&
                        !$matrix[$r + 10][$c]
                    ) {
                        $lostPoint += 40;
                    }
                }
            }
        }

        // Rule 4 (N4 = 10): Proportion of dark modules across the entire matrix
        $totalDark = 0;
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                if ($matrix[$r][$c]) {
                    $totalDark++;
                }
            }
        }

        $totalModules = $size * $size;
        $darkPercent = ($totalDark / $totalModules) * 100.0;
        $step = (int) floor(abs($darkPercent - 50.0) / 5.0);
        $lostPoint += $step * 10;

        return $lostPoint;
    }

    /**
     * Builds matrix for a given test/final pass with specific mask pattern.
     */
    private static function buildMatrix(
        int $version,
        string $ecLevel,
        array $codewords,
        int $maskPattern,
        bool $isTest
    ): array {
        $size = 17 + 4 * $version;
        $matrix = array_fill(0, $size, array_fill(0, $size, null));

        // 1. Finder patterns & Separators
        self::placeFinderAndSeparator($matrix, 0, 0);
        self::placeFinderAndSeparator($matrix, $size - 7, 0);
        self::placeFinderAndSeparator($matrix, 0, $size - 7);

        // 2. Alignment patterns
        $pos = self::getAlignmentPatternPositions($version);
        for ($i = 0; $i < count($pos); $i++) {
            for ($j = 0; $j < count($pos); $j++) {
                $row = $pos[$i];
                $col = $pos[$j];
                if ($matrix[$row][$col] !== null) {
                    continue;
                }
                for ($r = -2; $r <= 2; $r++) {
                    for ($c = -2; $c <= 2; $c++) {
                        $isBorderOrCenter = ($r === -2 || $r === 2 || $c === -2 || $c === 2 || ($r === 0 && $c === 0));
                        $matrix[$row + $r][$col + $c] = $isBorderOrCenter;
                    }
                }
            }
        }

        // 3. Timing patterns
        for ($i = 8; $i < $size - 8; $i++) {
            if ($matrix[$i][6] === null) {
                $matrix[$i][6] = ($i % 2 === 0);
            }
            if ($matrix[6][$i] === null) {
                $matrix[6][$i] = ($i % 2 === 0);
            }
        }

        // 4. Format information reservation / placement
        $ecMap = ['L' => 1, 'M' => 0, 'Q' => 3, 'H' => 2];
        $typeData = ($ecMap[$ecLevel] << 3) | $maskPattern;
        $bits = self::getBCHTypeInfo($typeData);

        // Vertical format bits
        for ($i = 0; $i < 15; $i++) {
            $mod = (!$isTest && (($bits >> $i) & 1) === 1);
            if ($i < 6) {
                $matrix[$i][8] = $mod;
            } elseif ($i < 8) {
                $matrix[$i + 1][8] = $mod;
            } else {
                $matrix[$size - 15 + $i][8] = $mod;
            }
        }

        // Horizontal format bits
        for ($i = 0; $i < 15; $i++) {
            $mod = (!$isTest && (($bits >> $i) & 1) === 1);
            if ($i < 8) {
                $matrix[8][$size - $i - 1] = $mod;
            } elseif ($i < 9) {
                $matrix[8][15 - $i - 1 + 1] = $mod;
            } else {
                $matrix[8][15 - $i - 1] = $mod;
            }
        }

        // 5. Version information (for v7+)
        if ($version >= 7) {
            $vBits = self::getBCHTypeNumber($version);
            for ($i = 0; $i < 18; $i++) {
                $mod = (!$isTest && (($vBits >> $i) & 1) === 1);
                $matrix[(int) floor($i / 3)][($i % 3) + $size - 8 - 3] = $mod;
                $matrix[($i % 3) + $size - 8 - 3][(int) floor($i / 3)] = $mod;
            }
        }

        // 6. Fixed dark module
        $matrix[$size - 8][8] = (!$isTest);

        // 7. Map Data Codewords with Mask Function
        $maskFunc = self::getMaskFunction($maskPattern);
        $inc = -1;
        $row = $size - 1;
        $bitIndex = 7;
        $byteIndex = 0;

        for ($col = $size - 1; $col > 0; $col -= 2) {
            if ($col === 6) {
                $col -= 1; // skip vertical timing column
            }
            while (true) {
                for ($c = 0; $c < 2; $c++) {
                    if ($matrix[$row][$col - $c] === null) {
                        $dark = false;
                        if ($byteIndex < count($codewords)) {
                            $dark = (($codewords[$byteIndex] >> $bitIndex) & 1) === 1;
                        }
                        if ($maskFunc($row, $col - $c)) {
                            $dark = !$dark;
                        }
                        $matrix[$row][$col - $c] = $dark;
                        $bitIndex--;
                        if ($bitIndex === -1) {
                            $byteIndex++;
                            $bitIndex = 7;
                        }
                    }
                }
                $row += $inc;
                if ($row < 0 || $row >= $size) {
                    $row -= $inc;
                    $inc = -$inc;
                    break;
                }
            }
        }

        return $matrix;
    }

    private static function placeFinderAndSeparator(array &$matrix, int $row, int $col): void
    {
        $size = count($matrix);
        for ($r = -1; $r <= 7; $r++) {
            if ($row + $r <= -1 || $size <= $row + $r) continue;
            for ($c = -1; $c <= 7; $c++) {
                if ($col + $c <= -1 || $size <= $col + $c) continue;
                if ((0 <= $r && $r <= 6 && ($c === 0 || $c === 6))
                    || (0 <= $c && $c <= 6 && ($r === 0 || $r === 6))
                    || (2 <= $r && $r <= 4 && 2 <= $c && $c <= 4)) {
                    $matrix[$row + $r][$col + $c] = true;
                } else {
                    $matrix[$row + $r][$col + $c] = false;
                }
            }
        }
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
        $version = self::determineVersion(count($dataBytes), $ecLevel);
        $codewords = self::createCodewords($data, $version, $ecLevel);

        // Evaluate all 8 masks to pick the optimal ISO mask pattern
        $minLostPoint = PHP_INT_MAX;
        $bestPattern = 0;

        for ($p = 0; $p < 8; $p++) {
            $testMatrix = self::buildMatrix($version, $ecLevel, $codewords, $p, true);
            $lostPoint = self::evaluateLostPoints($testMatrix);
            if ($lostPoint < $minLostPoint) {
                $minLostPoint = $lostPoint;
                $bestPattern = $p;
            }
        }

        // Build final matrix with chosen best mask
        return self::buildMatrix($version, $ecLevel, $codewords, $bestPattern, false);
    }

    /**
     * Validates whether a logo URL is safe from SSRF and script injection.
     */
    public static function isSafeLogoUrl(?string $url): bool
    {
        if ($url === null || $url === '') {
            return false;
        }

        $trimmed = trim($url);

        // Allow safe data URIs for inline images
        if (preg_match('/^data:image\/(?:png|jpeg|jpg|webp|svg\+xml);base64,[A-Za-z0-9+\/=\s]+$/i', $trimmed) === 1) {
            return true;
        }

        // Must start with http:// or https://
        if (preg_match('/^https?:\/\//i', $trimmed) !== 1) {
            return false;
        }

        $parts = parse_url($trimmed);
        if (!$parts || empty($parts['host'])) {
            return false;
        }

        $host = strtolower($parts['host']);

        // Block localhost and IPv6 loopback
        if ($host === 'localhost' || $host === '::1' || $host === '[::1]') {
            return false;
        }

        // Block IPv4 loopback, private networks, link-local, cloud metadata
        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $ipLong = ip2long($host);
            if ($ipLong === false) {
                return false;
            }

            // 127.0.0.0/8 (Loopback)
            if (($ipLong & 0xFF000000) === 0x7F000000) {
                return false;
            }
            // 10.0.0.0/8 (Private)
            if (($ipLong & 0xFF000000) === 0x0A000000) {
                return false;
            }
            // 172.16.0.0/12 (Private)
            if (($ipLong & 0xFFF00000) === 0xAC100000) {
                return false;
            }
            // 192.168.0.0/16 (Private)
            if (($ipLong & 0xFFFF0000) === 0xC0A80000) {
                return false;
            }
            // 169.254.0.0/16 (Link Local / Cloud Metadata)
            if (($ipLong & 0xFFFF0000) === 0xA9FE0000) {
                return false;
            }
            // 0.0.0.0/8
            if (($ipLong & 0xFF000000) === 0x00000000) {
                return false;
            }
        }

        return true;
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

        $targetSize = (int)($options['size'] ?? 360);
        if ($targetSize < 30 || $targetSize > 4000) {
            throw new InvalidArgumentException("QR size must be between 30 and 4000 pixels.");
        }

        $margin = (int)($options['margin'] ?? 16);
        if ($margin < 0 || $margin > 200) {
            throw new InvalidArgumentException("QR margin must be between 0 and 200 pixels.");
        }

        $fgColor = ColorSanitizer::sanitize($options['fgColor'] ?? '#000000', '#000000');
        $fgColor2 = ColorSanitizer::sanitize($options['fgColor2'] ?? '#2563eb', '#2563eb');
        $bgColor = ($options['bgColor'] ?? '#ffffff') === 'transparent'
            ? 'transparent'
            : ColorSanitizer::sanitize($options['bgColor'] ?? '#ffffff', '#ffffff');

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
            if (!self::isSafeLogoUrl($logoUrl)) {
                throw new InvalidArgumentException("Invalid or unsafe logo URL provided (SSRF / protocol blocked).");
            }

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
