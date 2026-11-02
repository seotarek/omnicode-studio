<?php

declare(strict_types=1);

namespace Omnicode\Laravel\Tests;

use PHPUnit\Framework\TestCase;
use Omnicode\Laravel\OmniCodeManager;
use Omnicode\Laravel\Facades\OmniCode;
use Omnicode\Laravel\View\Components\QrCodeComponent;
use Omnicode\Laravel\View\Components\BarcodeComponent;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Facade;

class OmniCodeLaravelTest extends TestCase
{
    private OmniCodeManager $manager;
    private array $defaultConfig;

    protected function setUp(): void
    {
        parent::setUp();

        $this->defaultConfig = [
            'disk' => 'public',
            'qr' => [
                'size' => 360,
                'margin' => 16,
                'ec_level' => 'H',
                'dot_type' => 'rounded',
                'fg_color' => '#059669',
                'bg_color' => '#ffffff'
            ],
            'barcode' => [
                'style' => 'classic',
                'width' => 2,
                'height' => 90,
                'line_color' => '#000000',
                'background' => '#ffffff'
            ]
        ];

        $this->manager = new OmniCodeManager($this->defaultConfig);

        // Bind mock app container to Facade and Storage
        $storageDriver = new class {
            public array $files = [];
            public function put(string $path, string $contents): bool {
                $this->files[$path] = $contents;
                return true;
            }
            public function get(string $path): ?string {
                return $this->files[$path] ?? null;
            }
        };

        $filesystem = new class($storageDriver) {
            private $driver;
            public function __construct($driver) { $this->driver = $driver; }
            public function disk(?string $name = null) { return $this->driver; }
        };

        if (class_exists(\Illuminate\Container\Container::class)) {
            $container = new \Illuminate\Container\Container();
            $container->instance('omnicode', $this->manager);
            $container->instance('config', ['omnicode' => $this->defaultConfig]);
            $container->instance('filesystem', $filesystem);
            Facade::setFacadeApplication($container);
        } else {
            $app = [
                'omnicode' => $this->manager,
                'config' => [
                    'omnicode' => $this->defaultConfig
                ],
                'filesystem' => $filesystem
            ];
            Facade::setFacadeApplication($app);
        }

        if (method_exists(Storage::class, 'swap')) {
            Storage::swap($filesystem);
        }
    }

    public function testManagerGeneratesValidQrSvg(): void
    {
        $svg = $this->manager->qr('https://omnicode.studio/laravel-test');

        $this->assertNotEmpty($svg);
        $this->assertStringContainsString('<svg', $svg);
        $this->assertStringContainsString('</svg>', $svg);
        $this->assertStringContainsString('viewBox="0 0 360 360"', $svg);
    }

    public function testManagerGeneratesValidBarcodeSvg(): void
    {
        $svg = $this->manager->barcode('4006381333931', 'EAN13', [
            'style' => 'thermal-label',
            'headerText' => 'INVENTORY ITEM',
            'footerText' => 'VERIFIED'
        ]);

        $this->assertNotEmpty($svg);
        $this->assertStringContainsString('<svg', $svg);
        $this->assertStringContainsString('</svg>', $svg);
        $this->assertStringContainsString('INVENTORY ITEM', $svg);
        $this->assertStringContainsString('VERIFIED', $svg);
    }

    public function testManagerValidatesScannability(): void
    {
        $result = $this->manager->validateScannability('#000000', '#ffffff', [
            'ecLevel' => 'H',
            'hasLogo' => false
        ]);

        $this->assertArrayHasKey('score', $result);
        $this->assertArrayHasKey('contrastRatio', $result);
        $this->assertArrayHasKey('isScannable', $result);
        $this->assertArrayHasKey('disclaimer', $result);
        $this->assertTrue($result['isScannable']);
        $this->assertGreaterThan(10, $result['contrastRatio']);
    }

    public function testStorageIntegration(): void
    {
        $qrPath = 'qrcodes/product-101.svg';
        $returnedPath = $this->manager->storeQr($qrPath, 'https://example.com/item/101');
        $this->assertSame($qrPath, $returnedPath);

        $storedSvg = Storage::disk('public')->get($qrPath);
        $this->assertNotNull($storedSvg);
        $this->assertStringContainsString('<svg', $storedSvg);

        $barcodePath = 'barcodes/ean-101.svg';
        $returnedBarcodePath = $this->manager->storeBarcode($barcodePath, '9780201379624', 'EAN13');
        $this->assertSame($barcodePath, $returnedBarcodePath);

        $storedBarcodeSvg = Storage::disk('public')->get($barcodePath);
        $this->assertNotNull($storedBarcodeSvg);
        $this->assertStringContainsString('<svg', $storedBarcodeSvg);
    }

    public function testFacadeDelegation(): void
    {
        $qrSvg = OmniCode::qr('https://omnicode.studio/facade');
        $this->assertStringContainsString('<svg', $qrSvg);

        $barcodeSvg = OmniCode::barcode('12345678', 'CODE128');
        $this->assertStringContainsString('<svg', $barcodeSvg);
    }

    public function testQrBladeComponent(): void
    {
        $component = new QrCodeComponent(
            data: 'https://omnicode.studio/blade-component',
            size: 240,
            ecc: 'M',
            dotType: 'square',
            fgColor: '#10b981',
            bgColor: '#ffffff'
        );

        $renderCallable = $component->render();
        $this->assertIsCallable($renderCallable);

        $svg = $renderCallable();
        $this->assertStringContainsString('<svg', $svg);
        $this->assertStringContainsString('viewBox="0 0 240 240"', $svg);
    }

    public function testBarcodeBladeComponent(): void
    {
        $component = new BarcodeComponent(
            data: '4006381333931',
            format: 'EAN13',
            style: 'thermal-label',
            header: 'SHELF 4B',
            footer: 'AUDITED',
            color: '#000000'
        );

        $renderCallable = $component->render();
        $this->assertIsCallable($renderCallable);

        $svg = $renderCallable();
        $this->assertStringContainsString('<svg', $svg);
        $this->assertStringContainsString('SHELF 4B', $svg);
        $this->assertStringContainsString('AUDITED', $svg);
    }
}
