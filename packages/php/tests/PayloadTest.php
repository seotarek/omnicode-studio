<?php

declare(strict_types=1);

namespace Omnicode\Tests;

use Omnicode\Payload\PayloadBuilder;
use PHPUnit\Framework\TestCase;

class PayloadTest extends TestCase
{
    public function testGs1DigitalLinkEncoderPadsTo14Digits(): void
    {
        $uri = PayloadBuilder::gs1DigitalLink('614141000036', [
            'lot' => 'BATCH-882',
            'serial' => 'SN-99014',
            'expiryDate' => '281231'
        ]);

        $this->assertStringContainsString('https://id.gs1.org/01/00614141000036', $uri);
        $this->assertStringContainsString('/10/BATCH-882', $uri);
        $this->assertStringContainsString('/21/SN-99014', $uri);
        $this->assertStringContainsString('17=281231', $uri);
    }

    public function testGs1DigitalLinkWithCustomDomainAndAttributes(): void
    {
        $uri = PayloadBuilder::gs1DigitalLink('04006381333931', [
            'domain' => 'https://id.brand.com/',
            'cpv' => 'COLOR-RED',
            'attributes' => ['custom_ref' => 'REF-7']
        ]);

        $this->assertStringStartsWith('https://id.brand.com/01/04006381333931/22/COLOR-RED', $uri);
        $this->assertStringContainsString('custom_ref=REF-7', $uri);
    }

    public function testEpcSepaEncoderGeneratesStandardFormat(): void
    {
        $payload = PayloadBuilder::epcSepa(
            'Red Cross Belgium',
            'BE72 0000 0000 1616',
            25.50,
            [
                'bic' => 'BPOTBEB1',
                'purpose' => 'CHAR',
                'remittanceInformation' => 'Emergency Relief 2026'
            ]
        );

        $lines = explode("\n", $payload);
        $this->assertSame('BCD', $lines[0]);
        $this->assertSame('002', $lines[1]);
        $this->assertSame('1', $lines[2]);
        $this->assertSame('SCT', $lines[3]);
        $this->assertSame('BPOTBEB1', $lines[4]);
        $this->assertSame('Red Cross Belgium', $lines[5]);
        $this->assertSame('BE72000000001616', $lines[6]);
        $this->assertSame('EUR25.50', $lines[7]);
        $this->assertSame('CHAR', $lines[8]);
        $this->assertSame('Emergency Relief 2026', $lines[10]);
    }

    public function testZatcaEInvoicingRoundTrip(): void
    {
        $seller = 'شركة أومني كود للتقنية المحدودة';
        $vatNo = '300000000000003';
        $timestamp = '2026-11-03T10:00:00Z';
        $total = '1150.00';
        $vat = '150.00';
        $xmlHash = 'base64EncodedXmlHashSample123456=';

        $base64 = PayloadBuilder::zatcaInvoice(
            $seller,
            $vatNo,
            $timestamp,
            $total,
            $vat,
            ['xmlHash' => $xmlHash]
        );

        $this->assertNotEmpty($base64);
        $decoded = PayloadBuilder::decodeZatcaInvoice($base64);

        $this->assertSame($seller, $decoded[1]);
        $this->assertSame($vatNo, $decoded[2]);
        $this->assertSame($timestamp, $decoded[3]);
        $this->assertSame('1150.00', $decoded[4]);
        $this->assertSame('150.00', $decoded[5]);
        $this->assertSame($xmlHash, $decoded[6]);
    }
}
