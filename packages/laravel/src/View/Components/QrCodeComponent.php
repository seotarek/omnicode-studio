<?php

declare(strict_types=1);

namespace Omnicode\Laravel\View\Components;

use Illuminate\View\Component;
use Omnicode\Laravel\Facades\OmniCode;

class QrCodeComponent extends Component
{
    public string $data;
    public int $size;
    public string $ecc;
    public string $dotType;
    public string $fgColor;
    public string $bgColor;

    public function __construct(
        string $data,
        int $size = 360,
        string $ecc = 'H',
        string $dotType = 'rounded',
        string $fgColor = '#000000',
        string $bgColor = '#ffffff'
    ) {
        $this->data = $data;
        $this->size = $size;
        $this->ecc = $ecc;
        $this->dotType = $dotType;
        $this->fgColor = $fgColor;
        $this->bgColor = $bgColor;
    }

    public function render()
    {
        $svg = OmniCode::qr($this->data, [
            'size' => $this->size,
            'ecLevel' => $this->ecc,
            'dotType' => $this->dotType,
            'fgColor' => $this->fgColor,
            'bgColor' => $this->bgColor
        ]);

        return function () use ($svg) {
            return $svg;
        };
    }
}
