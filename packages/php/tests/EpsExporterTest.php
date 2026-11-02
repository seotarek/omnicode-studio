<?php

declare(strict_types=1);

namespace Omnicode\Tests;

use Omnicode\Export\EpsExporter;
use Omnicode\OmniCode;
use PHPUnit\Framework\TestCase;

class EpsExporterTest extends TestCase
{
    public function testBarcodeSvgToEps(): void
    {
        $svg = OmniCode::barcode('PHP-EPS-12345', 'CODE128');
        $eps = EpsExporter::fromSvg($svg, [
            'title' => 'Barcode PHP Test',
            'creator' => 'PHPUnit Suite'
        ]);

        $this->assertStringStartsWith('%!PS-Adobe-3.0 EPSF-3.0', $eps);
        $this->assertStringContainsString('%%BoundingBox:', $eps);
        $this->assertStringContainsString('%%Title: Barcode PHP Test', $eps);
        $this->assertStringContainsString('%%Creator: PHPUnit Suite', $eps);
        $this->assertStringContainsString('/rf {', $eps);
        $this->assertStringContainsString('showpage', $eps);
        $this->assertStringContainsString('%%EOF', $eps);
    }

    public function testQrSvgToEps(): void
    {
        $svg = OmniCode::qr('https://omnicode.studio', ['width' => 450, 'height' => 450]);
        $eps = OmniCode::toEps($svg);

        $this->assertStringStartsWith('%!PS-Adobe-3.0 EPSF-3.0', $eps);
        $this->assertStringContainsString('%%BoundingBox: 0 0 450 450', $eps);
        $this->assertStringContainsString('showpage', $eps);
        $this->assertStringContainsString('%%EOF', $eps);
    }

    public function testFluentBuilderToEps(): void
    {
        $epsBarcode = OmniCode::barcode()->data('CODE-128-FLUENT')->format('CODE128')->toEps();
        $this->assertStringContainsString('%!PS-Adobe-3.0 EPSF-3.0', $epsBarcode);
        $this->assertStringContainsString('%%EOF', $epsBarcode);

        $epsQr = OmniCode::qr()->data('https://omnicode.studio/fluent')->size(380)->toEps();
        $this->assertStringContainsString('%!PS-Adobe-3.0 EPSF-3.0', $epsQr);
        $this->assertStringContainsString('%%EOF', $epsQr);
    }

    public function testBarWidthReductionEps(): void
    {
        $svg = OmniCode::barcode('BWR-TEST', 'CODE128');
        $epsNormal = EpsExporter::fromSvg($svg, ['barWidthReduction' => 0.0]);
        $epsBwr = EpsExporter::fromSvg($svg, ['barWidthReduction' => 0.4]);

        $this->assertNotEquals($epsNormal, $epsBwr);
        $this->assertStringContainsString('%!PS-Adobe-3.0 EPSF-3.0', $epsBwr);
    }
}
