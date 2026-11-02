<?php

declare(strict_types=1);

namespace Omnicode\Laravel\View\Components;

use Illuminate\View\Component;
use Omnicode\Laravel\Facades\OmniCode;

class BarcodeComponent extends Component
{
    public string $data;
    public string $format;
    public string $style;
    public ?string $header;
    public ?string $footer;
    public string $color;

    public function __construct(
        string $data,
        string $format = 'CODE128',
        string $style = 'classic',
        ?string $header = null,
        ?string $footer = null,
        string $color = '#000000'
    ) {
        $this->data = $data;
        $this->format = $format;
        $this->style = $style;
        $this->header = $header;
        $this->footer = $footer;
        $this->color = $color;
    }

    public function render()
    {
        $svg = OmniCode::barcode($this->data, $this->format, [
            'style' => $this->style,
            'headerText' => $this->header ?? '',
            'footerText' => $this->footer ?? '',
            'lineColor' => $this->color
        ]);

        return function () use ($svg) {
            return $svg;
        };
    }
}
