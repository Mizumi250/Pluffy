<?php

// ============================================================
// ARKZEN ENGINE — MIGRATION BUILDER
// PATCHED v5.1: Tatemono-slug folder isolation + table prefix + isolated DB
//   Before: migrations/arkzen/2026_create_inventories_table.php
//           Schema::create('inventories', ...)
//   After:  migrations/arkzen/inventory-management/2026_create_..._table.php
//           Schema::connection('inventory_management')->create('inventory_management_inventories', ...)
//
// Each tatemono gets its own SQLite file:
//   database/arkzen/inventory-management.sqlite
// ============================================================

namespace App\Arkzen\Builders;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class MigrationBuilder
{
    // ─────────────────────────────────────────────
    // COLUMN TYPE MAP
    // ─────────────────────────────────────────────

    private static array $typeMap = [
        'integer'    => 'integer',
        'bigInteger' => 'bigInteger',
        'string'     => 'string',
        'text'       => 'text',
        'longText'   => 'longText',
        'decimal'    => 'decimal',
        'float'      => 'float',
        'boolean'    => 'boolean',
        'date'       => 'date',
        'datetime'   => 'dateTime',
        'timestamp'  => 'timestamp',
        'json'       => 'json',
        'uuid'       => 'uuid',
    ];

    // ─────────────────────────────────────────────
    // BUILD
    // ─────────────────────────────────────────────

    public static function build(array $module): void
    {
        $name      = $module['name'];                               // tatemono slug
        $db        = $module['database'];
        $tableName = ModelBuilder::prefixedTable($name, $db['table']);
        $dbConn    = ModelBuilder::slugToConnection($name);
        $timestamp = date('Y_m_d_His');

        // Ensure the isolated database exists and is configured
        self::ensureDatabase($name, $dbConn);

        // Check table on the correct connection
        if (Schema::connection($dbConn)->hasTable($tableName)) {
            self::buildUpdateMigration($module, $tableName, $dbConn, $name);
            return;
        }

        // The per-tatemono databases are not committed, so on a fresh machine the
        // table is missing even though its create migration is. Re-run that file
        // instead of generating a duplicate.
        $existing = self::existingCreateMigration($name, $tableName);
        if ($existing) {
            self::runMigration($existing, $name);
            if (Schema::connection($dbConn)->hasTable($tableName)) {
                self::buildUpdateMigration($module, $tableName, $dbConn, $name);
            } else {
                Log::warning("[Arkzen Migration] {$tableName} still missing after running " . basename($existing));
            }
            return;
        }

        $className = self::toClassName($tableName);
        $fileName  = "{$timestamp}_create_{$tableName}_table.php";
        $filePath  = database_path("migrations/arkzen/{$name}/{$fileName}");

        File::ensureDirectoryExists(database_path("migrations/arkzen/{$name}"));

        $content = self::generateCreateMigration($className, $db, $tableName, $dbConn);
        File::put($filePath, $content);
        Log::info("[Arkzen Migration] ✓ Migration created: {$name}/{$fileName}");

        self::runMigration($filePath, $name);
    }

    // ─────────────────────────────────────────────
    // ENSURE ISOLATED DB EXISTS + CONFIGURED (sqlite file or pgsql database)
    // ─────────────────────────────────────────────

    public static function ensureDatabase(string $tatSlug, string $dbConn): void
    {
        \App\Arkzen\Support\ArkzenDatabase::ensure($tatSlug);
    }

    // ─────────────────────────────────────────────
    // GENERATE CREATE MIGRATION
    // ─────────────────────────────────────────────

    private static function generateCreateMigration(string $className, array $db, string $tableName, string $dbConn): string
    {
        $columns     = self::generateColumns($db['columns']);
        $indexes     = self::generateIndexes($db['indexes'] ?? []);
        $timestamps  = $db['timestamps']  ? "\n            \$table->timestamps();"  : '';
        $softDeletes = $db['softDeletes'] ? "\n            \$table->softDeletes();" : '';

        return "<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — {$tableName}
// Connection: {$dbConn}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: " . now()->toISOString() . "
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected \$connection = '{$dbConn}';

    public function up(): void
    {
        Schema::connection('{$dbConn}')->create('{$tableName}', function (Blueprint \$table) {
{$columns}{$indexes}{$timestamps}{$softDeletes}
        });
    }

    public function down(): void
    {
        Schema::connection('{$dbConn}')->dropIfExists('{$tableName}');
    }
};
";
    }

    // ─────────────────────────────────────────────
    // GENERATE COLUMNS
    // ─────────────────────────────────────────────

    private static function generateColumns(array $columns): string
    {
        $lines = [];

        foreach ($columns as $name => $config) {
            $line = self::generateColumn($name, $config);
            if ($line) {
                $lines[] = "            {$line}";
            }
        }

        return implode("\n", $lines);
    }

    private static function generateColumn(string $name, array $config): string
    {
        $type   = $config['type'] ?? 'string';
        $method = self::$typeMap[$type] ?? 'string';

        if (!empty($config['primary']) && !empty($config['autoIncrement'])) {
            return "\$table->id();";
        }

        if ($type === 'uuid' && !empty($config['primary'])) {
            return "\$table->uuid('{$name}')->primary();";
        }

        if (!empty($config['foreign'])) {
            [$refTable, $refColumn] = explode('.', $config['foreign']);
            $onDelete = $config['onDelete'] ?? 'cascade';
            $nullable = !empty($config['nullable']) ? '->nullable()' : '';
            return "\$table->foreignId('{$name}'){$nullable}->constrained('{$refTable}')->onDelete('{$onDelete}');";
        }

        $call = "\$table->{$method}('{$name}'";

        if ($method === 'string' && !empty($config['length'])) {
            $call .= ", {$config['length']}";
        }

        if ($method === 'decimal') {
            $precision = $config['precision'] ?? 8;
            $scale     = $config['scale'] ?? 2;
            $call      = "\$table->decimal('{$name}', {$precision}, {$scale}";
        }

        $call .= ')';

        if (!empty($config['nullable']))   $call .= '->nullable()';
        if (!empty($config['unique']))     $call .= '->unique()';
        if (isset($config['default'])) {
            $default = is_string($config['default'])
                ? "'{$config['default']}'"
                : var_export($config['default'], true);
            $call .= "->default({$default})";
        }
        if (!empty($config['unsigned']))   $call .= '->unsigned()';

        return "{$call};";
    }

    // ─────────────────────────────────────────────
    // GENERATE INDEXES
    // ─────────────────────────────────────────────

    private static function generateIndexes(array $indexes): string
    {
        if (empty($indexes)) return '';

        $lines = ["\n"];

        foreach ($indexes as $index) {
            $cols    = "['" . implode("', '", $index['columns']) . "']";
            $method  = !empty($index['unique']) ? 'unique' : 'index';
            $lines[] = "            \$table->{$method}({$cols});";
        }

        return implode("\n", $lines);
    }

    // ─────────────────────────────────────────────
    // UPDATE MIGRATION
    // ─────────────────────────────────────────────

    private static function buildUpdateMigration(array $module, string $tableName, string $dbConn, string $name): void
    {
        $db = $module['database'];

        $newColumns = [];
        foreach ($db['columns'] as $colName => $config) {
            if (!empty($config['primary'])) continue;
            if (!Schema::connection($dbConn)->hasColumn($tableName, $colName)) {
                $newColumns[$colName] = $config;
            }
        }

        if (empty($newColumns)) {
            Log::info("[Arkzen Migration] Table '{$tableName}' on '{$dbConn}' is up to date.");
            return;
        }

        $timestamp = date('Y_m_d_His');
        $fileName  = "{$timestamp}_update_{$tableName}_table.php";
        $filePath  = database_path("migrations/arkzen/{$name}/{$fileName}");

        File::ensureDirectoryExists(database_path("migrations/arkzen/{$name}"));

        $columns = self::generateColumns($newColumns);

        $content = "<?php

// ============================================================
// ARKZEN GENERATED UPDATE MIGRATION — {$tableName}
// Connection: {$dbConn}
// Generated: " . now()->toISOString() . "
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected \$connection = '{$dbConn}';

    public function up(): void
    {
        Schema::connection('{$dbConn}')->table('{$tableName}', function (Blueprint \$table) {
{$columns}
        });
    }

    public function down(): void
    {
        // Reverse if needed
    }
};
";

        File::put($filePath, $content);
        Log::info("[Arkzen Migration] ✓ Update migration: {$name}/{$fileName}");

        self::runMigration($filePath, $name);
    }

    // ─────────────────────────────────────────────
    // RUN MIGRATION
    // ─────────────────────────────────────────────

    private static function runMigration(string $filePath, string $name): void
    {
        Log::info("[Arkzen Migration] Running migration for: {$name}");
    
        $exitCode = Artisan::call('migrate', [
            '--path'     => $filePath,
            '--realpath' => true,
            '--force'    => true,
        ]);
    
        $output = Artisan::output();
    
        if ($exitCode !== 0) {
            Log::error("[Arkzen Migration] ✗ Migration FAILED for {$name}. Exit: {$exitCode}. Output: {$output}");
            throw new \RuntimeException("[Arkzen Migration] Migration failed for {$name}: {$output}");
        }
    
        Log::info("[Arkzen Migration] ✓ Migration executed: {$name}. Output: {$output}");
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    private static function existingCreateMigration(string $name, string $tableName): ?string
    {
        $files = glob(database_path("migrations/arkzen/{$name}") . DIRECTORY_SEPARATOR . "*_create_{$tableName}_table.php") ?: [];
        sort($files);
        return $files[0] ?? null;
    }

    private static function toClassName(string $tableName): string
    {
        return str_replace('_', '', ucwords($tableName, '_'));
    }
}