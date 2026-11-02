<?php

declare(strict_types=1);

// Load autoloader from local vendor or sibling php package vendor
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} elseif (file_exists(__DIR__ . '/../../php/vendor/autoload.php')) {
    require_once __DIR__ . '/../../php/vendor/autoload.php';
}

// Autoload Omnicode\Laravel\ namespace from src/
spl_autoload_register(function ($class) {
    $prefix = 'Omnicode\\Laravel\\';
    $baseDir = __DIR__ . '/../src/';
    $len = strlen($prefix);

    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

// Provide lightweight stubs for Illuminate classes when testing outside full Laravel runtime
if (!class_exists(\Illuminate\Support\Facades\Storage::class)) {
    eval('
        namespace Illuminate\Support\Facades;

        class Storage
        {
            public static array $fakeStorage = [];

            public static function disk(?string $disk = null)
            {
                return new class($disk) {
                    private ?string $disk;
                    public function __construct(?string $disk) { $this->disk = $disk ?? "default"; }
                    public function put(string $path, string $contents): bool
                    {
                        Storage::$fakeStorage[$this->disk . ":" . $path] = $contents;
                        return true;
                    }
                    public function get(string $path): ?string
                    {
                        return Storage::$fakeStorage[$this->disk . ":" . $path] ?? null;
                    }
                };
            }

            public static function swap($instance): void
            {
            }
        }
    ');
}

if (!class_exists(\Illuminate\View\Component::class)) {
    eval('
        namespace Illuminate\View;

        abstract class Component
        {
            abstract public function render();
        }
    ');
}

if (!class_exists(\Illuminate\Support\Facades\Facade::class)) {
    eval('
        namespace Illuminate\Support\Facades;

        abstract class Facade
        {
            protected static $app;
            public static function setFacadeApplication($app) { static::$app = $app; }
            abstract protected static function getFacadeAccessor(): string;

            public static function __callStatic($method, $args)
            {
                $accessor = static::getFacadeAccessor();
                $instance = static::$app[$accessor] ?? null;
                if (!$instance) {
                    throw new \RuntimeException("Facade root not set for {$accessor}");
                }
                return $instance->$method(...$args);
            }
        }
    ');
}
