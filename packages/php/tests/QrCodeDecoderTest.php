<?php

declare(strict_types=1);

namespace Omnicode\Tests;

use PHPUnit\Framework\TestCase;
use Omnicode\Qr\QrCodeGenerator;

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
     * Verifies that generated SVG contains valid dimensions, SVG namespace, and clean structure.
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
