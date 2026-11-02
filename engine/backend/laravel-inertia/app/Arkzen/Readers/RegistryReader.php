<?php

// ============================================================
// ARKZEN ENGINE — REGISTRY READER
// Reads arkzen.json shared between frontend and backend
// ============================================================

namespace App\Arkzen\Readers;

use Illuminate\Support\Facades\File;

class RegistryReader
{
    private const CODE_MARKERS = 'endpoint|handler|middleware|policy|listener|listeners|job|jobs|console|mail|notification|notifications';

    private const BACKEND_LABELS = [
        'laravel' => 'Laravel',
        'laravel-inertia' => 'Laravel',
        'express' => 'Express',
        'fastapi' => 'FastAPI / Django',
        'django' => 'FastAPI / Django',
        'spring-boot' => 'Spring Boot',
        'aspnet' => 'ASP.NET',
    ];

    // ─────────────────────────────────────────────
    // PATH
    // arkzen.json lives at project root
    // same file frontend watcher writes to
    // ─────────────────────────────────────────────

    private static function registryPath(): string
    {
        return base_path('arkzen.json');
    }

    // ─────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────

    public static function read(): array
    {
        $path = self::registryPath();
        $registry = File::exists($path)
            ? (json_decode(File::get($path), true) ?? [])
            : [
                'engine' => '1.0.0',
                'project' => basename(base_path()),
                'modules' => [],
            ];
        $repoRoot = realpath(base_path('../../..')) ?: base_path();
        $rootPath = $repoRoot . DIRECTORY_SEPARATOR . 'arkzen.json';
        $rootRegistry = is_file($rootPath)
            ? (json_decode(File::get($rootPath), true) ?? [])
            : [];
        $activeConfig = array_merge($registry, $rootRegistry);

        $modules = [];
        foreach (array_merge(
            self::discoverModules($repoRoot),
            $rootRegistry['modules'] ?? [],
            $registry['modules'] ?? [],
        ) as $module) {
            if (!is_array($module) || empty($module['name'])) {
                continue;
            }
            $name = (string) $module['name'];
            $modules[$name] = array_merge($modules[$name] ?? [], $module);
        }

        $registry['activeStack'] = $activeConfig['activeStack'] ?? 'nextjs';
        $registry['activeBackend'] = $activeConfig['activeBackend'] ?? 'laravel';
        $registry['activeDatabase'] = $activeConfig['activeDatabase'] ?? 'sqlite';
        $registry['modules'] = array_values(array_map(
            fn (array $module): array => self::enrichModule($module, $repoRoot, $registry['activeBackend']),
            $modules,
        ));
        return $registry;
    }

    private static function discoverModules(string $repoRoot): array
    {
        $directory = $repoRoot . DIRECTORY_SEPARATOR . 'tatemonos';
        if (!is_dir($directory)) {
            return [];
        }

        $modules = [];
        foreach (scandir($directory) ?: [] as $folder) {
            if ($folder === '.' || $folder === '..') {
                continue;
            }
            $file = $directory . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . 'core.tsx';
            if (!is_file($file)) {
                continue;
            }
            $source = File::get($file);
            if (!preg_match('/\\/\\* @arkzen:meta\\b([\\s\\S]*?)\\*\\//', $source, $meta)) {
                continue;
            }
            $name = self::metaField($meta[1], 'name');
            if (!$name) {
                continue;
            }
            $version = self::metaField($meta[1], 'version') ?: '1.0.0';
            $modules[] = [
                'name' => $name,
                'version' => $version,
                'status' => 'active',
                'filePath' => 'tatemonos/' . $folder . '/core.tsx',
                'pages' => self::pageNames($source),
                'registered' => date(DATE_ATOM, filectime($file) ?: filemtime($file)),
                'lastUpdated' => date(DATE_ATOM, filemtime($file)),
                'auth' => strtolower(self::metaField($meta[1], 'auth') ?: 'false') === 'true',
            ];
        }
        return $modules;
    }

    private static function metaField(string $meta, string $field): ?string
    {
        $pattern = "/^\\s*" . preg_quote($field, '/') . ":\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s#]+))/m";
        if (!preg_match($pattern, $meta, $match)) {
            return null;
        }
        return $match[1] !== '' ? $match[1] : ($match[2] !== '' ? $match[2] : ($match[3] ?? null));
    }

    private static function pageNames(string $source): array
    {
        preg_match_all('/\\/\\* @arkzen:(?:web|native):page:(?!layout:)([a-zA-Z0-9_-]+)/', $source, $matches);
        return array_values(array_unique(array_filter($matches[1] ?? [], fn ($name) => $name !== 'end' && $name !== 'layout')));
    }

    private static function enrichModule(array $module, string $repoRoot, string $activeBackend): array
    {
        $relativePath = $module['filePath'] ?? ('tatemonos/' . ($module['name'] ?? '') . '/core.tsx');
        $sourcePath = $repoRoot . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
        if (!is_file($sourcePath)) {
            return array_merge($module, ['frontend' => [], 'backend' => []]);
        }

        $source = File::get($sourcePath);
        $variants = self::backendVariants($source);
        $hasBackend = preg_match('/auth:\\s*true|@arkzen:(?:api|database|auth|jobs|events|mail|notifications|routes|realtime|console|store)/', $source) === 1;
        if (!$variants && $hasBackend) {
            $variants[] = self::BACKEND_LABELS[$activeBackend] ?? 'Laravel';
        }

        $hasWeb = preg_match('/@arkzen:(?:web:|meta:web\\b)/', $source) === 1;
        $hasApp = preg_match('/@arkzen:(?:native:|meta:native\\b)/', $source) === 1;
        $frontend = [];
        if ($hasWeb) {
            $frontend = array_merge($frontend, ['Next.js', 'React + Vite', 'React + Inertia', 'Astro', 'TanStack Start', 'Tauri', 'Electron']);
        }
        if ($hasApp) {
            $frontend = array_merge($frontend, ['Expo', 'React Native', 'Lynx']);
        }

        return array_merge($module, [
            'filePath' => str_replace('\\', '/', $relativePath),
            'pages' => $module['pages'] ?? self::pageNames($source),
            'frontend' => array_values(array_unique($frontend)),
            'backend' => array_values(array_unique($variants)),
        ]);
    }

    private static function backendVariants(string $source): array
    {
        $pattern = '/^\\/\\* @arkzen:(' . self::CODE_MARKERS . '):(?:(php|ts|py|java|cs):)?([a-zA-Z0-9_-]+)(?:\\s+\\*\\/)?\\s*$/m';
        preg_match_all($pattern, $source, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);
        $labels = [
            'php' => 'Laravel',
            'ts' => 'Express',
            'py' => 'FastAPI / Django',
            'java' => 'Spring Boot',
            'cs' => 'ASP.NET',
        ];
        $variants = [];
        foreach ($matches as $match) {
            $marker = $match[1][0];
            $variant = $match[2][0] ?: null;
            $name = $match[3][0];
            $close = $variant
                ? "/* @arkzen:{$marker}:{$variant}:{$name}:end */"
                : "/* @arkzen:{$marker}:{$name}:end */";
            $start = $match[0][1];
            $inlineClose = strpos($match[0][0], '*/');
            $openingEnd = $inlineClose !== false
                ? $start + $inlineClose
                : strpos($source, '*/', $start + strlen($match[0][0]));
            if ($openingEnd === false) {
                continue;
            }
            $closingStart = strpos($source, $close, $openingEnd + 2);
            if ($closingStart === false || trim(substr($source, $openingEnd + 2, $closingStart - $openingEnd - 2)) === '') {
                continue;
            }
            $variants[] = $labels[$variant ?? 'php'];
        }
        return array_values(array_unique($variants));
    }

    // ─────────────────────────────────────────────
    // WRITE
    // ─────────────────────────────────────────────

    public static function write(array $registry): void
    {
        File::put(
            self::registryPath(),
            json_encode($registry, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }

    // ─────────────────────────────────────────────
    // UPDATE MODULE STATUS
    // ─────────────────────────────────────────────

    public static function updateModuleStatus(string $name, string $status): void
    {
        $registry = self::read();

        foreach ($registry['modules'] as &$module) {
            if ($module['name'] === $name) {
                $module['status']      = $status;
                $module['lastUpdated'] = now()->toISOString();
                break;
            }
        }

        self::write($registry);
    }

    // ─────────────────────────────────────────────
    // GET ACTIVE MODULES
    // ─────────────────────────────────────────────

    public static function getActiveModules(): array
    {
        $registry = self::read();
        return array_filter(
            $registry['modules'] ?? [],
            fn($m) => $m['status'] === 'active'
        );
    }

    // ─────────────────────────────────────────────
    // IS REGISTERED
    // ─────────────────────────────────────────────

    public static function isRegistered(string $name): bool
    {
        $registry = self::read();
        $names = array_column($registry['modules'] ?? [], 'name');
        return in_array($name, $names);
    }
}
