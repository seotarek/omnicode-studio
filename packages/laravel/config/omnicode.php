<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Storage disk used by OmniCode to persist generated QR codes and barcodes.
    | Defaults to your application's default filesystem disk (e.g. 'local', 'public', 's3').
    |
    */
    'disk' => env('OMNICODE_DISK', config('filesystems.default', 'public')),

    /*
    |--------------------------------------------------------------------------
    | QR Code Defaults
    |--------------------------------------------------------------------------
    */
    'qr' => [
        'size' => 360,
        'margin' => 16,
        'ec_level' => 'H', // L, M, Q, H
        'dot_type' => 'rounded', // square, rounded, dots
        'fg_color' => '#000000',
        'bg_color' => '#ffffff',
    ],

    /*
    |--------------------------------------------------------------------------
    | Barcode Defaults
    |--------------------------------------------------------------------------
    */
    'barcode' => [
        'format' => 'CODE128',
        'style' => 'classic', // classic, rounded, pill, gradient, thermal-label, price-tag, badge-frame
        'width' => 2,
        'height' => 90,
        'line_color' => '#000000',
        'background' => '#ffffff',
    ],
];
