<?php

// ============================================================
// ARKZEN — PER-TATEMONO DATABASE
// Every tatemono gets its own isolated database:
//   sqlite (default): database/arkzen/{slug}.sqlite
//   pgsql:            Postgres database "{ARKZEN_DB_PREFIX}_{slug}"
// Driver comes from ARKZEN_DB_DRIVER (written by setup.js / mizumi db).
// ============================================================

namespace App\Arkzen\Support;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class ArkzenDatabase
{
    public static function driver(): string
    {
        return env('ARKZEN_DB_DRIVER', 'sqlite') === 'pgsql' ? 'pgsql' : 'sqlite';
    }

    public static function connectionName(string $slug): string
    {
        return str_replace('-', '_', $slug);
    }

    public static function pgDatabaseName(string $slug): string
    {
        return strtolower(env('ARKZEN_DB_PREFIX', 'pluff') . '_' . self::connectionName($slug));
    }

    public static function connectionConfig(string $slug): array
    {
        if (self::driver() === 'pgsql') {
            return array_merge(config('database.connections.pgsql'), [
                'database' => self::pgDatabaseName($slug),
            ]);
        }

        return [
            'driver'   => 'sqlite',
            'database' => database_path("arkzen/{$slug}.sqlite"),
            'prefix'   => '',
            'foreign_key_constraints' => true,
        ];
    }

    public static function register(string $slug): string
    {
        $conn = self::connectionName($slug);
        Config::set("database.connections.{$conn}", self::connectionConfig($slug));
        DB::purge($conn);
        return $conn;
    }

    public static function ensure(string $slug): string
    {
        if (self::driver() === 'pgsql') {
            $name   = self::pgDatabaseName($slug);
            $exists = DB::connection('pgsql')->selectOne('select 1 from pg_database where datname = ?', [$name]);
            if (!$exists) {
                DB::connection('pgsql')->statement('create database "' . $name . '"');
                Log::info("[Arkzen DB] ✓ Created isolated Postgres database: {$name}");
            }
        } else {
            $dbFile = database_path("arkzen/{$slug}.sqlite");
            File::ensureDirectoryExists(dirname($dbFile));
            if (!file_exists($dbFile)) {
                file_put_contents($dbFile, '');
                Log::info("[Arkzen DB] ✓ Created isolated DB: database/arkzen/{$slug}.sqlite");
            }
        }

        return self::register($slug);
    }

    public static function drop(string $slug): void
    {
        DB::purge(self::connectionName($slug));

        if (self::driver() === 'pgsql') {
            $name = self::pgDatabaseName($slug);
            DB::connection('pgsql')->statement('drop database if exists "' . $name . '" with (force)');
            Log::info("[Arkzen] ✓ Dropped isolated Postgres database: {$name}");
        }

        $dbFile = database_path("arkzen/{$slug}.sqlite");
        if (File::exists($dbFile)) {
            File::delete($dbFile);
            Log::info("[Arkzen] ✓ Deleted isolated DB: database/arkzen/{$slug}.sqlite");
        }
    }

    // Registers a connection for every known tatemono at boot. Only config is
    // set here; nothing connects until a model or query uses it.
    public static function registerAll(): void
    {
        $slugs = [];
        foreach (File::glob(database_path('arkzen') . '/*.sqlite') ?: [] as $file) {
            $slugs[] = basename($file, '.sqlite');
        }
        if (self::driver() === 'pgsql') {
            foreach ([base_path('../../../tatemonos'), database_path('migrations/arkzen')] as $dir) {
                if (!File::isDirectory($dir)) continue;
                foreach (File::directories($dir) as $sub) {
                    $slugs[] = basename($sub);
                }
            }
        }

        foreach (array_unique($slugs) as $slug) {
            $conn = self::connectionName($slug);
            if (!Config::has("database.connections.{$conn}")) {
                Config::set("database.connections.{$conn}", self::connectionConfig($slug));
            }
        }
    }
}
