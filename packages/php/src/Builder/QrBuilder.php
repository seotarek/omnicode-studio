<?php

declare(strict_types=1);

namespace Omnicode\Builder;

use Omnicode\Qr\QrCodeGenerator;

class QrBuilder
{
    protected array $options = [
        'data' => 'https://omnicode.studio',
        'size' => 360,
        'margin' => 16,
        'ecLevel' => 'M',
        'dotType' => 'rounded',
        'cornerSquareType' => 'extra-rounded',
        'cornerDotType' => 'dot',
        'fgColor' => '#000000',
        'bgColor' => '#ffffff',
        'format' => 'svg'
    ];

    public function data(string $data): self
    {
        $this->options['data'] = $data;
        return $this;
    }

    public function size(int $size): self
    {
        $this->options['size'] = $size;
        return $this;
    }

    public function margin(int $margin): self
    {
        $this->options['margin'] = $margin;
        return $this;
    }

    public function errorCorrection(string $level): self
    {
        $this->options['ecLevel'] = strtoupper($level);
        return $this;
    }

    public function ecLevel(string $level): self
    {
        return $this->errorCorrection($level);
    }

    public function dots(string $dotType): self
    {
        $this->options['dotType'] = $dotType;
        return $this;
    }

    public function cornerSquare(string $type): self
    {
        $this->options['cornerSquareType'] = $type;
        return $this;
    }

    public function cornerDot(string $type): self
    {
        $this->options['cornerDotType'] = $type;
        return $this;
    }

    public function color(string $fgColor): self
    {
        $this->options['fgColor'] = $fgColor;
        return $this;
    }

    public function backgroundColor(string $bgColor): self
    {
        $this->options['bgColor'] = $bgColor;
        return $this;
    }

    public function gradient(string $color1, string $color2): self
    {
        $this->options['fgColor'] = $color1;
        $this->options['fgColor2'] = $color2;
        $this->options['isGradient'] = true;
        return $this;
    }

    public function logo(string $url): self
    {
        $this->options['logoUrl'] = $url;
        return $this;
    }

    public function format(string $format): self
    {
        $this->options['format'] = strtolower($format);
        return $this;
    }

    public function getOptions(): array
    {
        return $this->options;
    }

    public function generate(): string
    {
        return QrCodeGenerator::generateSvg($this->options);
    }

    public function toBase64(): string
    {
        return base64_encode($this->generate());
    }

    public function toDataUrl(string $mimeType = 'image/svg+xml'): string
    {
        return 'data:' . $mimeType . ';base64,' . $this->toBase64();
    }
}
