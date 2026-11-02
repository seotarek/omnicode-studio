<?php

declare(strict_types=1);

namespace Omnicode\Laravel\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Omnicode\Laravel\Facades\OmniCode;

class GenerateCodeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $type; // 'qr' or 'barcode'
    public string $path;
    public string $data;
    public array $options;
    public ?string $disk;

    public function __construct(string $type, string $path, string $data, array $options = [], ?string $disk = null)
    {
        $this->type = $type;
        $this->path = $path;
        $this->data = $data;
        $this->options = $options;
        $this->disk = $disk;
    }

    public function handle(): void
    {
        if ($this->type === 'qr') {
            OmniCode::storeQr($this->path, $this->data, $this->options, $this->disk);
        } else {
            $format = $this->options['format'] ?? 'CODE128';
            OmniCode::storeBarcode($this->path, $this->data, $format, $this->options, $this->disk);
        }
    }
}
