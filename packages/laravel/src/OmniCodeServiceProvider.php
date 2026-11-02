<?php

declare(strict_types=1);

namespace Omnicode\Laravel;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Omnicode\Laravel\View\Components\QrCodeComponent;
use Omnicode\Laravel\View\Components\BarcodeComponent;

class OmniCodeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/omnicode.php', 'omnicode');

        $this->app->singleton('omnicode', function ($app) {
            return new OmniCodeManager($app['config']['omnicode'] ?? []);
        });
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../config/omnicode.php' => config_path('omnicode.php'),
            ], 'omnicode-config');
        }

        // Register Blade Components
        Blade::component('omnicode-qr', QrCodeComponent::class);
        Blade::component('omnicode-barcode', BarcodeComponent::class);
    }
}
