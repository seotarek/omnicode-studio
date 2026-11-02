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
}
