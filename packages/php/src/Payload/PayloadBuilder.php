<?php

declare(strict_types=1);

namespace Omnicode\Payload;

class PayloadBuilder
{
    public static function wifi(string $ssid, string $password = '', string $encryption = 'WPA', bool $hidden = false): string
    {
        $safeSsid = addcslashes($ssid, ';,:\\"');
        $safePass = addcslashes($password, ';,:\\"');
        $h = $hidden ? 'true' : 'false';
        return "WIFI:T:{$encryption};S:{$safeSsid};P:{$safePass};H:{$h};;";
    }

    public static function vCard(array $info): string
    {
        $lines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'N:' . ($info['lastName'] ?? '') . ';' . ($info['firstName'] ?? '') . ';;;',
            'FN:' . trim(($info['firstName'] ?? '') . ' ' . ($info['lastName'] ?? ''))
        ];
        if (!empty($info['organization'])) $lines[] = 'ORG:' . $info['organization'];
        if (!empty($info['title'])) $lines[] = 'TITLE:' . $info['title'];
        if (!empty($info['phone'])) $lines[] = 'TEL;TYPE=CELL:' . $info['phone'];
        if (!empty($info['email'])) $lines[] = 'EMAIL:' . $info['email'];
        if (!empty($info['url'])) $lines[] = 'URL:' . $info['url'];
        if (!empty($info['address'])) $lines[] = 'ADR:;;' . $info['address'] . ';;;;';
        $lines[] = 'END:VCARD';
        return implode("\n", $lines);
    }

    public static function whatsApp(string $phone, string $text = ''): string
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        $url = "https://wa.me/{$cleanPhone}";
        return $text !== '' ? "{$url}?text=" . rawurlencode($text) : $url;
    }

    public static function email(string $to, string $subject = '', string $body = ''): string
    {
        $query = [];
        if ($subject !== '') $query[] = 'subject=' . rawurlencode($subject);
        if ($body !== '') $query[] = 'body=' . rawurlencode($body);
        $qs = count($query) > 0 ? '?' . implode('&', $query) : '';
        return "mailto:{$to}{$qs}";
    }

    public static function crypto(string $currency, string $address, ?float $amount = null, string $message = ''): string
    {
        $scheme = strtolower($currency);
        $query = [];
        if ($amount !== null) $query[] = "amount={$amount}";
        if ($message !== '') $query[] = 'message=' . rawurlencode($message);
        $qs = count($query) > 0 ? '?' . implode('&', $query) : '';
        return "{$scheme}:{$address}{$qs}";
    }

    /**
     * Encodes GS1 Digital Link standard URI (Sunrise 2027 compliant).
     */
    public static function gs1DigitalLink(string $gtin, array $options = []): string
    {
        $domain = rtrim($options['domain'] ?? 'https://id.gs1.org', '/');
        $cleanGtin = preg_replace('/\D/', '', $gtin);
        if ($cleanGtin === '' || strlen($cleanGtin) > 14) {
            throw new \InvalidArgumentException('Invalid GTIN: must be numeric with up to 14 digits');
        }
        $gtin14 = str_pad($cleanGtin, 14, '0', STR_PAD_LEFT);

        $uriPath = "{$domain}/01/{$gtin14}";

        if (!empty($options['lot'])) {
            $uriPath .= '/10/' . rawurlencode((string)$options['lot']);
        }
        if (!empty($options['serial'])) {
            $uriPath .= '/21/' . rawurlencode((string)$options['serial']);
        }
        if (!empty($options['cpv'])) {
            $uriPath .= '/22/' . rawurlencode((string)$options['cpv']);
        }

        $query = [];
        if (!empty($options['expiryDate'])) {
            $query['17'] = preg_replace('/\D/', '', (string)$options['expiryDate']);
        }
        if (!empty($options['attributes']) && is_array($options['attributes'])) {
            foreach ($options['attributes'] as $k => $v) {
                $query[$k] = (string)$v;
            }
        }

        $qs = http_build_query($query);
        return $qs !== '' ? "{$uriPath}?{$qs}" : $uriPath;
    }

    /**
     * Encodes European Payments Council SEPA QR Code (EPC069-12 standard).
     */
    public static function epcSepa(string $beneficiaryName, string $iban, ?float $amount = null, array $options = []): string
    {
        if (trim($beneficiaryName) === '') {
            throw new \InvalidArgumentException('Beneficiary name is required for EPC SEPA payment');
        }
        if (trim($iban) === '') {
            throw new \InvalidArgumentException('IBAN is required for EPC SEPA payment');
        }

        $cleanIban = strtoupper((string)preg_replace('/\s+/', '', $iban));
        $version = $options['version'] ?? '002';
        $bic = isset($options['bic']) ? strtoupper(trim((string)$options['bic'])) : '';
        $amountStr = ($amount !== null && $amount > 0) ? 'EUR' . number_format($amount, 2, '.', '') : '';

        $lines = [
            'BCD',
            $version,
            '1', // UTF-8
            'SCT',
            $bic,
            mb_substr($beneficiaryName, 0, 70),
            $cleanIban,
            $amountStr,
            isset($options['purpose']) ? strtoupper(mb_substr((string)$options['purpose'], 0, 4)) : '',
            isset($options['remittanceReference']) ? mb_substr((string)$options['remittanceReference'], 0, 35) : '',
            isset($options['remittanceInformation']) ? mb_substr((string)$options['remittanceInformation'], 0, 140) : '',
            isset($options['beneficiaryOriginatorInfo']) ? mb_substr((string)$options['beneficiaryOriginatorInfo'], 0, 70) : ''
        ];

        return implode("\n", $lines);
    }

    /**
     * Encodes Saudi Arabia ZATCA E-Invoicing (Fatoora) Phase 1 & 2 QR Code into Base64 TLV.
     */
    public static function zatcaInvoice(
        string $sellerName,
        string $vatNumber,
        string $timestamp,
        float|string $total,
        float|string $vat,
        array $phase2 = []
    ): string {
        $tags = [
            1 => $sellerName,
            2 => $vatNumber,
            3 => $timestamp,
            4 => is_float($total) ? number_format($total, 2, '.', '') : (string)$total,
            5 => is_float($vat) ? number_format($vat, 2, '.', '') : (string)$vat,
        ];

        if (!empty($phase2['xmlHash'])) $tags[6] = (string)$phase2['xmlHash'];
        if (!empty($phase2['digitalSignature'])) $tags[7] = (string)$phase2['digitalSignature'];
        if (!empty($phase2['publicKey'])) $tags[8] = (string)$phase2['publicKey'];
        if (!empty($phase2['caSignature'])) $tags[9] = (string)$phase2['caSignature'];

        $buffer = '';
        foreach ($tags as $tag => $val) {
            $len = strlen($val);
            if ($len > 255) {
                throw new \InvalidArgumentException("Tag {$tag} length exceeds 255 bytes");
            }
            $buffer .= chr($tag) . chr($len) . $val;
        }

        return base64_encode($buffer);
    }

    /**
     * Decodes Saudi Arabia ZATCA Base64 TLV byte string into an associative array of tags.
     */
    public static function decodeZatcaInvoice(string $base64Tlv): array
    {
        $raw = base64_decode($base64Tlv, true);
        if ($raw === false) {
            throw new \InvalidArgumentException('Invalid Base64 payload');
        }

        $tags = [];
        $len = strlen($raw);
        $i = 0;
        while ($i < $len) {
            $tag = ord($raw[$i]);
            $tagLen = ord($raw[$i + 1]);
            $val = substr($raw, $i + 2, $tagLen);
            $tags[$tag] = $val;
            $i += 2 + $tagLen;
        }

        return $tags;
    }
}
