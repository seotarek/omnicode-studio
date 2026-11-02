<?php

declare(strict_types=1);

namespace Omnicode\Laravel\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Omnicode\Laravel\Facades\OmniCode;

class GenerateCodeBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $items;
    public ?string $storageDirectory;
    public ?string $disk;

    /**
     * @param array $items Array of items, e.g. [['id' => '1', 'type' => 'qr', 'path' => 'qrs/1.svg', 'options' => [...]]]
     */
    public function __construct(array $items, ?string $storageDirectory = null, ?string $disk = null)
    {
        $this->items = $items;
        $this->storageDirectory = $storageDirectory;
        $this->disk = $disk;
    }

    public function handle(): array
    {
        $results = [];
        foreach ($this->items as $item) {
            $type = $item['type'] ?? 'qr';
            $data = $item['data'] ?? ($item['options']['data'] ?? '');
            $path = $item['path'] ?? null;
            $options = $item['options'] ?? [];

            if ($path && $this->storageDirectory) {
                $targetPath = rtrim($this->storageDirectory, '/') . '/' . ltrim($path, '/');
            } else {
                $targetPath = $path;
            }

            if ($type === 'qr') {
                if ($targetPath) {
                    $results[] = [
                        'id' => $item['id'] ?? null,
                        'path' => OmniCode::storeQr($targetPath, $data, $options, $this->disk),
                        'success' => true
                    ];
                } else {
                    $results[] = [
                        'id' => $item['id'] ?? null,
                        'svg' => OmniCode::qr($data, $options),
                        'success' => true
                    ];
                }
            } else {
                $format = $options['format'] ?? ($item['format'] ?? 'CODE128');
                if ($targetPath) {
                    $results[] = [
                        'id' => $item['id'] ?? null,
                        'path' => OmniCode::storeBarcode($targetPath, $data, $format, $options, $this->disk),
                        'success' => true
                    ];
                } else {
                    $results[] = [
                        'id' => $item['id'] ?? null,
                        'svg' => OmniCode::barcode($data, $format, $options),
                        'success' => true
                    ];
                }
            }
        }

        return $results;
    }
}
