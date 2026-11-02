<?php

declare(strict_types=1);

namespace Omnicode\Tests;

use PHPUnit\Framework\TestCase;
use Omnicode\Barcode\BarcodeGenerator;

class BarcodeTest extends TestCase
{
    public function testGs1Mod10CheckDigit(): void
    {
        // 400638133393 + 1 = 4006381333931
        $check = BarcodeGenerator::calculateMod10CheckDigit('400638133393');
        $this->assertSame(1, $check);

        // UPC-A 01234567890 + 5 = 012345678905
        $upcCheck = BarcodeGenerator::calculateMod10CheckDigit('01234567890');
        $this->assertSame(5, $upcCheck);
    }

    public function testEan13Validation(): void
    {
        $valid = BarcodeGenerator::validate('EAN13', '4006381333931');
        $this->assertTrue($valid['isValid']);

        $invalid = BarcodeGenerator::validate('EAN13', '4006381333939');
        $this->assertFalse($invalid['isValid']);
        $this->assertStringContainsString('Invalid EAN-13 check digit', $invalid['error']);
    }

    public function testPharmacodeRangeValidation(): void
    {
        $valid = BarcodeGenerator::validate('pharmacode', '131070');
        $this->assertTrue($valid['isValid']);

        $outOfRange = BarcodeGenerator::validate('pharmacode', '131071');
        $this->assertFalse($outOfRange['isValid']);
    }

    public function testGenerateSvgThermalWarehouseLabel(): void
    {
        $svg = BarcodeGenerator::generateSvg([
            'format' => 'CODE128',
            'data' => 'AIR-LOGISTICS-99',
            'style' => 'thermal-label',
            'headerText' => 'WAREHOUSE DISPATCH <CENTER>',
            'footerText' => 'CARRIER VERIFIED'
        ]);

        $this->assertStringContainsString('<svg', $svg);
        $this->assertStringContainsString('WAREHOUSE DISPATCH &lt;CENTER&gt;', $svg);
        $this->assertStringContainsString('CARRIER VERIFIED', $svg);
        $this->assertStringNotContainsString('<CENTER>', $svg); // Escaped
    }
}
