<?php

// ============================================================
// ARKZEN ENGINE — REGISTRY READER
// Reads arkzen.json shared between frontend and backend
// ============================================================

namespace App\Arkzen\Readers;

use Illuminate\Support\Facades\File;

class RegistryReader
{
    // ─────────────────────────────────────────────
    // PATH
    // arkzen.json lives at project root
    // same file frontend watcher writes to
    // ─────────────────────────────────────────────

    private static function registryPath(): string
    {
        return base_path('arkzen.json');
    }

    private static function repositoryRoot(): string
    {
        return dirname(base_path(), 3);
    }

    // ─────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────

    public static function read(): array
    {
        $path = self::registryPath();
        $rootPath = self::repositoryRoot() . DIRECTORY_SEPARATOR . 'arkzen.json';

        if (!File::exists($path)) {
            $path = $rootPath;
        }

        if (!File::exists($path)) {
            $registry = [
                'engine'  => '1.0.0',
                'project' => basename(base_path()),
                'modules' => [],
            ];
        } else {
            $registry = json_decode(File::get($path), true) ?? [];
        }

        $root = File::exists($rootPath) ? (json_decode(File::get($rootPath), true) ?? []) : $registry;
        $activeStack = $root['activeStack'] ?? $registry['activeStack'] ?? 'nextjs';
        $registry['activeStack'] = $activeStack;
        $registry['activeBackend'] = $activeStack === 'react-inertia'
            ? 'laravel-inertia'
            : ($root['activeBackend'] ?? $registry['activeBackend'] ?? 'laravel');
        $registry['activeDatabase'] = $root['activeDatabase'] ?? $registry['activeDatabase'] ?? 'sqlite';

        $repoRoot = self::repositoryRoot();
        $registry['modules'] = array_map(static function (array $module) use ($repoRoot): array {
            $sourcePath = $repoRoot . DIRECTORY_SEPARATOR . str_replace(
                ['/', '\\'],
                DIRECTORY_SEPARATOR,
                $module['filePath'] ?? ''
            );
            if (!File::exists($sourcePath)) {
                return array_merge($module, ['frontend' => [], 'backend' => []]);
            }

            $source = File::get($sourcePath);
            $hasBackend = preg_match('/auth:\\s*true|@arkzen:(?:api|database|auth|jobs|events|mail|notifications|routes|realtime|console|store)/', $source) === 1;
            $hasVariant = preg_match('/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):(?:php|ts|py|java|cs|go|rs)\\b/', $source) === 1;
            $hasLaravel = preg_match('/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):php\\b/', $source) === 1;
            $backend = [];
            if ($hasBackend && ($hasLaravel || !$hasVariant)) $backend[] = 'Laravel';
            if (preg_match('/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):ts\\b/', $source)) $backend[] = 'Express';
            if (preg_match('/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):py\\b/', $source)) $backend[] = 'FastAPI / Django';
            if (preg_match('/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):java\\b/', $source)) $backend[] = 'Spring Boot';
            if (preg_match('/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):cs\\b/', $source)) $backend[] = 'ASP.NET';
            if (preg_match('/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):go\\b/', $source)) $backend[] = 'Go';
            if (preg_match('/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):rs\\b/', $source)) $backend[] = 'Rust';

            $frontend = [];
            $hasWeb = preg_match('/@arkzen:(?:web:|meta:web\\b)/', $source) === 1;
            if ($hasWeb) {
                $frontend = array_merge($frontend, ['Next.js', 'React + Vite', 'React + Inertia', 'Astro', 'TanStack Start']);
            }
            if (preg_match('/@arkzen:(?:native:|meta:native\\b)/', $source)) {
                $frontend = array_merge($frontend, ['Expo', 'React Native', 'Lynx']);
            }
            $hasDesktop = preg_match('/@arkzen:desktop:|desktopConfig|@arkzen:meta:desktop/', $source) === 1;
            if ($hasWeb || $hasDesktop) {
                $frontend = array_merge($frontend, ['Tauri', 'Electron']);
            }

            return array_merge($module, [
                'frontend' => array_values(array_unique($frontend)),
                'backend' => array_values(array_unique($backend)),
            ]);
        }, $registry['modules'] ?? []);

        return $registry;
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
