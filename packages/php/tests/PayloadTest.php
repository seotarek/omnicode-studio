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

    public function testGs1DigitalLinkDecoderParsesAiSegments(): void
    {
        $uri = 'https://id.gs1.org/01/06291041500213/10/BATCH-99/21/SER-01?17=261231';
        $decoded = PayloadBuilder::decodeGs1DigitalLink($uri);

        $this->assertSame('https://id.gs1.org', $decoded['domain']);
        $this->assertSame('06291041500213', $decoded['gtin']);
        $this->assertSame('BATCH-99', $decoded['lot']);
        $this->assertSame('SER-01', $decoded['serial']);
        $this->assertSame('261231', $decoded['expiryDate']);
    }

    public function testEpcSepaDecoderParsesStructuredFields(): void
    {
        $payload = "BCD\n002\n1\nSCT\nBPOTBEB1\nRed Cross Belgium\nBE72000000001616\nEUR25.50\nCHAR\n\nRelief Donation";
        $decoded = PayloadBuilder::decodeEpcSepa($payload);

        $this->assertSame('Red Cross Belgium', $decoded['beneficiaryName']);
        $this->assertSame('BE72000000001616', $decoded['iban']);
        $this->assertSame('BPOTBEB1', $decoded['bic']);
        $this->assertSame(25.50, $decoded['amount']);
        $this->assertSame('EUR', $decoded['currency']);
        $this->assertSame('CHAR', $decoded['purpose']);
        $this->assertSame('Relief Donation', $decoded['remittanceInformation']);
    }

    public function testWifiDecoderParsesEscapedCredentials(): void
    {
        $payload = 'WIFI:T:WPA;S:Enterprise\;WiFi;P:Secr\\;et2026!;H:true;;';
        $decoded = PayloadBuilder::decodeWifi($payload);

        $this->assertSame('Enterprise;WiFi', $decoded['ssid']);
        $this->assertSame('Secr;et2026!', $decoded['password']);
        $this->assertSame('WPA', $decoded['encryption']);
        $this->assertTrue($decoded['hidden']);
    }

    public function testVCardDecoderParsesContactDetails(): void
    {
        $payload = "BEGIN:VCARD\nVERSION:3.0\nN:Mohamed;Tarek;;;\nFN:Tarek Mohamed\nORG:OmniCode\nTEL;TYPE=CELL:+966500000000\nEMAIL:t@omnicode.studio\nEND:VCARD";
        $decoded = PayloadBuilder::decodeVCard($payload);

        $this->assertSame('Tarek', $decoded['firstName']);
        $this->assertSame('Mohamed', $decoded['lastName']);
        $this->assertSame('OmniCode', $decoded['organization']);
        $this->assertSame('+966500000000', $decoded['phone']);
        $this->assertSame('t@omnicode.studio', $decoded['email']);
    }
}
