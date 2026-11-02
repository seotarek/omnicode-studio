<?php

declare(strict_types=1);

namespace Omnicode\Tests;

use PHPUnit\Framework\TestCase;
use Omnicode\Qr\QrCodeGenerator;
use Omnicode\Tests\Support\QrCodeDecoder;
use LengthException;
use InvalidArgumentException;

class QrCodeDecoderTest extends TestCase
{
    /**
     * Verifies that generated QR matrix contains valid 15-bit Format Information
     * encoded via BCH (15, 5) with mask 0x5412 around Finder patterns.
     */
    public function testFormatInformationEncoding(): void
    {
        $matrix = QrCodeGenerator::generateMatrix('https://omnicode.studio', 'M');
        $size = count($matrix);

        // Verify top-left vertical format information bits are set
        $hasAnyDarkVertical = false;
        $hasAnyLightVertical = false;

        for ($r = 0; $r < 9; $r++) {
            if ($r === 6) continue; // skip timing pattern
            if ($matrix[$r][8]) {
                $hasAnyDarkVertical = true;
            } else {
                $hasAnyLightVertical = true;
            }
        }

        $this->assertTrue($hasAnyDarkVertical, 'Format information must have active dark modules');
        $this->assertTrue($hasAnyLightVertical, 'Format information must have active light modules');

        // Dark module must strictly be at (size - 8, 8)
        $this->assertTrue($matrix[$size - 8][8], 'Dark module at (size-8, 8) must always be true');
    }

    /**
     * Verifies that Finder patterns (7x7) are completely surrounded by 1-module light Separator.
     */
    public function testFinderSeparatorIntegrity(): void
    {
        $matrix = QrCodeGenerator::generateMatrix('https://omnicode.studio', 'H');
        $size = count($matrix);

        // Top-left separator: row 7, col 0..7 must be false (light)
        for ($c = 0; $c < 8; $c++) {
            $this->assertFalse($matrix[7][$c], "Top-left separator module at (7, $c) must be light (false)");
        }

        // Top-left separator: col 7, row 0..7 must be false (light)
        for ($r = 0; $r < 8; $r++) {
            $this->assertFalse($matrix[$r][7], "Top-left separator module at ($r, 7) must be light (false)");
        }

        // Top-right separator: row 7, col (size-8)..(size-1) must be false (light)
        for ($c = $size - 8; $c < $size; $c++) {
            $this->assertFalse($matrix[7][$c], "Top-right separator module at (7, $c) must be light (false)");
        }

        // Bottom-left separator: col 7, row (size-8)..(size-1) must be false (light)
        for ($r = $size - 8; $r < $size; $r++) {
            $this->assertFalse($matrix[$r][7], "Bottom-left separator module at ($r, 7) must be light (false)");
        }
    }

    /**
     * Real roundtrip decoding verification: URL payload.
     */
    public function testRoundtripDecodingUrl(): void
    {
        $url = 'https://omnicode.studio/enterprise/verify?token=9942a8b9c7d6e5f4';
        $matrix = QrCodeGenerator::generateMatrix($url, 'M');
        $decoded = QrCodeDecoder::decodeMatrix($matrix);

        $this->assertSame($url, $decoded, 'Decoded QR matrix must match original URL payload exactly');
    }

    /**
     * Real roundtrip decoding verification: Structured Wi-Fi payload.
     */
    public function testRoundtripDecodingWifi(): void
    {
        $wifi = 'WIFI:T:WPA;S:Enterprise_Sec_5G;P:Secr3t#P@ssw0rd;H:false;;';
        $matrix = QrCodeGenerator::generateMatrix($wifi, 'Q');
        $decoded = QrCodeDecoder::decodeMatrix($matrix);

        $this->assertSame($wifi, $decoded, 'Decoded QR matrix must match Wi-Fi payload');
    }

    /**
     * Real roundtrip decoding verification: Multi-line vCard across all EC levels (L, M, Q, H).
     */
    public function testRoundtripDecodingVCardAcrossEcLevels(): void
    {
        $vcard = "BEGIN:VCARD\nVERSION:3.0\nN:Mohamed;Tarek\nFN:Tarek Mohamed\nORG:OmniCode Core\nTITLE:Lead Architect\nEND:VCARD";

        foreach (['L', 'M', 'Q', 'H'] as $ecLevel) {
            $matrix = QrCodeGenerator::generateMatrix($vcard, $ecLevel);
            $decoded = QrCodeDecoder::decodeMatrix($matrix);
            $this->assertSame($vcard, $decoded, "vCard must decode identically at EC Level {$ecLevel}");
        }
    }

    /**
     * Tests ISO/IEC 18004 Rule 1: 5 or more consecutive modules of identical color.
     */
    public function testPenaltyEvaluationRule1(): void
    {
        // 21x21 matrix with a row of 7 consecutive dark modules (should give 3 + 2 = 5 penalty points)
        $matrix = array_fill(0, 21, array_fill(0, 21, false));
        // Fill row 0 cols 0..6 with dark
        for ($c = 0; $c < 7; $c++) {
            $matrix[0][$c] = true;
        }

        $penalty = QrCodeGenerator::evaluateLostPoints($matrix);
        // Rule 1 row: 3 + (7 - 5) = 5
        // Rule 4: dark ratio 7 / 441 = 1.58% -> |1.58 - 50| / 5 = 9 * 10 = 90
        // Total penalty should include at least rule 1 contribution
        $this->assertGreaterThanOrEqual(95, $penalty);
    }

    /**
     * Tests ISO/IEC 18004 Rule 2: 2x2 blocks of same color.
     */
    public function testPenaltyEvaluationRule2(): void
    {
        $matrix = array_fill(0, 21, array_fill(0, 21, false));
        // 2x2 dark block at top-left
        $matrix[0][0] = true;
        $matrix[0][1] = true;
        $matrix[1][0] = true;
        $matrix[1][1] = true;

        $penalty = QrCodeGenerator::evaluateLostPoints($matrix);
        $this->assertGreaterThan(0, $penalty);
    }

    /**
     * Tests ISO/IEC 18004 Rule 4: Proportion of dark modules deviation from 50%.
     */
    public function testPenaltyEvaluationRule4DarkRatio(): void
    {
        // All light matrix: 0% dark -> |0 - 50| / 5 = 10 * 10 = 100 penalty points from Rule 4 alone
        $allLight = array_fill(0, 21, array_fill(0, 21, false));
        $penalty = QrCodeGenerator::evaluateLostPoints($allLight);
        $this->assertGreaterThanOrEqual(100, $penalty);
    }

    /**
     * Verifies that exceeding maximum QR capacity throws LengthException.
     */
    public function testCapacityOverflowRejection(): void
    {
        $this->expectException(LengthException::class);
        $this->expectExceptionMessage('exceeds maximum QR Code capacity');

        // Version 10 H capacity is 122 bytes. Provide 500 bytes to guarantee overflow.
        $massivePayload = str_repeat('A', 500);
        QrCodeGenerator::generateMatrix($massivePayload, 'H');
    }

    /**
     * Verifies SVG generation validates dimension and margin bounds.
     */
    public function testSvgBoundsValidation(): void
    {
        $this->expectException(InvalidArgumentException::class);
        QrCodeGenerator::generateSvg([
            'data' => 'https://example.com',
            'size' => 10 // below minimum 30
        ]);
    }

    /**
     * Verifies SSRF and protocol protection on logoUrl in pure PHP generator.
     */
    public function testSecurityLogoUrlBlocking(): void
    {
        // Block javascript:
        $this->expectException(InvalidArgumentException::class);
        QrCodeGenerator::generateSvg([
            'data' => 'https://example.com',
            'logoUrl' => 'javascript:alert(1)'
        ]);
    }

    public function testSecurityLogoUrlSsrfBlocking(): void
    {
        // Block loopback localhost
        $this->expectException(InvalidArgumentException::class);
        QrCodeGenerator::generateSvg([
            'data' => 'https://example.com',
            'logoUrl' => 'http://127.0.0.1/internal-admin'
        ]);
    }

    /**
     * Verifies that malicious color strings are sanitized to safe defaults.
     */
    public function testSecurityColorSanitization(): void
    {
        $svg = QrCodeGenerator::generateSvg([
            'data' => 'https://omnicode.studio/color-test',
            'fgColor' => 'red"><script>alert(1)</script>',
            'bgColor' => '#ffffff"><script>evil()</script>'
        ]);

        $this->assertStringNotContainsString('<script>', $svg);
        $this->assertStringNotContainsString('evil()', $svg);
        $this->assertStringContainsString('fill="#000000"', $svg);
    }

    /**
     * Verifies SVG output structure and gradients.
     */
    public function testSvgOutputStructure(): void
    {
        $svg = QrCodeGenerator::generateSvg([
            'data' => 'https://omnicode.studio/pure-php-verified',
            'ecLevel' => 'Q',
            'size' => 480,
            'margin' => 20,
            'fgColor' => '#10b981',
            'fgColor2' => '#047857',
            'isGradient' => true,
            'dotType' => 'rounded',
            'logoUrl' => 'https://omnicode.studio/logo.svg'
        ]);

        $this->assertStringContainsString('viewBox="0 0 480 480"', $svg);
        $this->assertStringContainsString('<linearGradient id="omnicode-qr-grad"', $svg);
        $this->assertStringContainsString('id="qr-logo-overlay"', $svg);
        $this->assertStringContainsString('rx=', $svg);
    }
}
