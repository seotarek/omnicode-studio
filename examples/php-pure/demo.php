<?php

declare(strict_types=1);

require_once __DIR__ . '/../../packages/php/vendor/autoload.php';

use Omnicode\OmniCode;

echo "=== 1. Fluent QR Builder ===\n";
$qrSvg = OmniCode::qr()
    ->data('https://omnicode.studio/enterprise')
    ->errorCorrection('H')
    ->dots('rounded')
    ->color('#0D7377')
    ->backgroundColor('#FFFFFF')
    ->generate();

echo "Generated QR SVG (Length: " . strlen($qrSvg) . " bytes)\n";

echo "\n=== 2. Fluent Barcode Builder ===\n";
$barcodeSvg = OmniCode::barcode()
    ->format('EAN13')
    ->data('4006381333931')
    ->validate()
    ->style('thermal-label')
    ->header('WAREHOUSE D')
    ->footer('PALLET #42')
    ->generate();

echo "Generated Barcode SVG (Length: " . strlen($barcodeSvg) . " bytes)\n";

echo "\n=== 3. Batch Processing ===\n";
$batch = OmniCode::batch([
    ['id' => 'item-1', 'type' => 'qr', 'options' => ['data' => 'https://example.com/1']],
    ['id' => 'item-2', 'type' => 'barcode', 'options' => ['data' => '4006381333931', 'format' => 'EAN13']]
]);

echo "Batch processed: " . count($batch) . " items.\n";
foreach ($batch as $res) {
    echo " - Item " . $res['id'] . ": " . ($res['success'] ? "SUCCESS" : "FAILED") . "\n";
}

echo "\n=== 4. Base64 & Data URL Export ===\n";
$dataUrl = OmniCode::toDataUrl($qrSvg);
echo "Data URL Prefix: " . substr($dataUrl, 0, 40) . "...\n";
