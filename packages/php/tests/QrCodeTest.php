<?php

declare(strict_types=1);

namespace Omnicode\Tests;

use PHPUnit\Framework\TestCase;
use Omnicode\Qr\QrCodeGenerator;
use Omnicode\Payload\PayloadBuilder;
use Omnicode\Validator\ScannabilityValidator;

class QrCodeTest extends TestCase
{
    public function testGenerateMatrix(): void
    {
        $matrix = QrCodeGenerator::generateMatrix('https://omnicode.studio', 'M');
        $this->assertIsArray($matrix);
        $this->assertGreaterThan(20, count($matrix));
        // Top-left finder pattern corner must be true
        $this->assertTrue($matrix[0][0]);
    }

    public function testGenerateSvg(): void
    {
        $svg = QrCodeGenerator::generateSvg([
            'data' => 'https://omnicode.studio/enterprise',
            'ecLevel' => 'H',
            'size' => 400,
            'dotType' => 'rounded',
            'fgColor' => '#059669',
            'bgColor' => '#ffffff'
        ]);

        $this->assertStringContainsString('<svg', $svg);
        $this->assertStringContainsString('viewBox="0 0 400 400"', $svg);
        $this->assertStringContainsString('rx=', $svg);
    }

    public function testPayloadBuilderWifiAndVcard(): void
    {
        $wifi = PayloadBuilder::wifi('CorpNetwork', 'Secret;Pass', 'WPA');
        $this->assertSame('WIFI:T:WPA;S:CorpNetwork;P:Secret\\;Pass;H:false;;', $wifi);

        $vcard = PayloadBuilder::vCard([
            'firstName' => 'Tarek',
            'lastName' => 'Mohamed',
            'phone' => '+201000000000',
            'email' => 'tarek@omnicode.studio'
        ]);
        $this->assertStringContainsString('BEGIN:VCARD', $vcard);
        $this->assertStringContainsString('FN:Tarek Mohamed', $vcard);
        $this->assertStringContainsString('END:VCARD', $vcard);
    }

    public function testScannabilityValidator(): void
    {
        $contrast = ScannabilityValidator::calculateContrast('#000000', '#ffffff');
        $this->assertGreaterThan(15.0, $contrast);

        $result = ScannabilityValidator::validate('#777777', '#888888', 'M');
        $this->assertFalse($result['isScannable']);
        $this->assertNotEmpty($result['warnings']);
    }
}
