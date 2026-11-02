<?php

declare(strict_types=1);

namespace Omnicode\Tests;

use Omnicode\OmniCode;
use Omnicode\Builder\QrBuilder;
use Omnicode\Builder\BarcodeBuilder;
use PHPUnit\Framework\TestCase;

class OmniCodeTest extends TestCase
{
    public function testFluentQrBuilderGeneratesValidSvg(): void
    {
        $builder = OmniCode::qr();
        $this->assertInstanceOf(QrBuilder::class, $builder);

        $svg = $builder->data('https://example.com/product/123')
            ->errorCorrection('H')
            ->dots('rounded')
            ->color('#0D7377')
            ->backgroundColor('#FFFFFF')
            ->generate();

        $this->assertStringStartsWith('<svg', $svg);
        $this->assertStringEndsWith('</svg>', $svg);
        $this->assertStringContainsString('#0D7377', $svg);
    }

    public function testFluentBarcodeBuilderGeneratesValidSvg(): void
    {
        $builder = OmniCode::barcode();
        $this->assertInstanceOf(BarcodeBuilder::class, $builder);

        $svg = $builder->format('EAN13')
            ->data('4006381333931')
            ->validate()
            ->color('#111827')
            ->backgroundColor('#FFFFFF')
            ->generate();

        $this->assertStringStartsWith('<svg', $svg);
        $this->assertStringEndsWith('</svg>', $svg);
        $this->assertStringContainsString('#111827', $svg);
    }

    public function testBarcodeBuilderValidationRejectsInvalidData(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        OmniCode::barcode()
            ->format('EAN13')
            ->data('4006381333939') // invalid check digit
            ->validate();
    }

    public function testStaticCompatibilityMode(): void
    {
        $qrSvg = OmniCode::qr('https://omnicode.studio', ['ecLevel' => 'Q']);
        $this->assertIsString($qrSvg);
        $this->assertStringStartsWith('<svg', $qrSvg);

        $barcodeSvg = OmniCode::barcode('4006381333931', 'EAN13');
        $this->assertIsString($barcodeSvg);
        $this->assertStringStartsWith('<svg', $barcodeSvg);
    }

    public function testSupportedFormatsMatrix(): void
    {
        $formats = OmniCode::getSupportedFormats();
        $this->assertArrayHasKey('barcodes', $formats);
        $this->assertContains('CODE128', $formats['barcodes']);
        $this->assertContains('EAN13', $formats['barcodes']);
        $this->assertContains('MSI', $formats['barcodes']);
        $this->assertContains('codabar', $formats['barcodes']);
        $this->assertEquals(['L', 'M', 'Q', 'H'], $formats['qrErrorLevels']);
    }

    public function testBatchProcessing(): void
    {
        $items = [
            [
                'id' => 'qr-item',
                'type' => 'qr',
                'options' => ['data' => 'https://batch.example.com']
            ],
            [
                'id' => 'barcode-item',
                'type' => 'barcode',
                'options' => ['data' => '4006381333931', 'format' => 'EAN13']
            ],
            [
                'id' => 'invalid-item',
                'type' => 'barcode',
                'options' => ['data' => 'INVALID_CHECK', 'format' => 'EAN13']
            ]
        ];

        $results = OmniCode::batch($items);
        $this->assertCount(3, $results);

        $this->assertTrue($results[0]['success']);
        $this->assertStringStartsWith('<svg', $results[0]['svg']);

        $this->assertTrue($results[1]['success']);
        $this->assertStringStartsWith('<svg', $results[1]['svg']);

        $this->assertFalse($results[2]['success']);
        $this->assertArrayHasKey('error', $results[2]);
    }

    public function testBase64AndDataUrlHelpers(): void
    {
        $svg = '<svg width="10" height="10"></svg>';
        $b64 = OmniCode::toBase64($svg);
        $this->assertEquals(base64_encode($svg), $b64);

        $dataUrl = OmniCode::toDataUrl($svg);
        $this->assertStringStartsWith('data:image/svg+xml;base64,', $dataUrl);
    }
}
