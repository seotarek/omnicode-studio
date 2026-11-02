<?php

declare(strict_types=1);

namespace Omnicode\Builder;

use Omnicode\Barcode\BarcodeGenerator;

class BarcodeBuilder
{
    protected array $options = [
        'data' => '12345678',
        'format' => 'CODE128',
        'style' => 'classic',
        'width' => 2,
        'height' => 90,
        'lineColor' => '#000000',
        'background' => '#ffffff',
        'displayValue' => true,
        'format_type' => 'svg'
    ];

    public function format(string $format): self
    {
        $this->options['format'] = strtoupper($format);
        return $this;
    }

    public function data(string $data): self
    {
        $this->options['data'] = $data;
        return $this;
    }

    public function style(string $style): self
    {
        $this->options['style'] = $style;
        return $this;
    }

    public function width(int $width): self
    {
        $this->options['width'] = $width;
        return $this;
    }

    public function height(int $height): self
    {
        $this->options['height'] = $height;
        return $this;
    }

    public function color(string $lineColor): self
    {
        $this->options['lineColor'] = $lineColor;
        return $this;
    }

    public function lineColor(string $lineColor): self
    {
        return $this->color($lineColor);
    }

    public function backgroundColor(string $background): self
    {
        $this->options['background'] = $background;
        return $this;
    }

    public function displayValue(bool $show = true): self
    {
        $this->options['displayValue'] = $show;
        return $this;
    }

    public function header(string $text): self
    {
        $this->options['headerText'] = $text;
        return $this;
    }

    public function footer(string $text): self
    {
        $this->options['footerText'] = $text;
        return $this;
    }

    public function formatOutput(string $format): self
    {
        $this->options['format_type'] = strtolower($format);
        return $this;
    }

    public function validate(): self
    {
        $result = BarcodeGenerator::validate(
            $this->options['format'] ?? 'CODE128',
            $this->options['data'] ?? ''
        );
        if (!$result['isValid']) {
            throw new \InvalidArgumentException($result['error'] ?? 'Invalid barcode data');
        }
        return $this;
    }

    public function isValid(): bool
    {
        $result = BarcodeGenerator::validate(
            $this->options['format'] ?? 'CODE128',
            $this->options['data'] ?? ''
        );
        return (bool)$result['isValid'];
    }


    public function getOptions(): array
    {
        return $this->options;
    }

    public function generate(): string
    {
        return BarcodeGenerator::generateSvg($this->options);
    }

    public function toBase64(): string
    {
        return base64_encode($this->generate());
    }

    public function toDataUrl(string $mimeType = 'image/svg+xml'): string
    {
        return 'data:' . $mimeType . ';base64,' . $this->toBase64();
    }

    public function toEps(array $options = []): string
    {
        return \Omnicode\Export\EpsExporter::fromSvg($this->generate(), $options);
    }
}
