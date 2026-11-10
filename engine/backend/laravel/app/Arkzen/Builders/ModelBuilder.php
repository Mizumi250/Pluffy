<?php

// ============================================================
// ARKZEN ENGINE — MODEL BUILDER v5.3 (FIXED)
// FIXED: Physical folder now uses namespace-safe name (no hyphens)
//   inventory-management → InventoryManagement (both namespace AND folder)
// ============================================================

namespace App\Arkzen\Builders;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class ModelBuilder
{
    public static function build(array $module): void
    {
        $name      = $module['name'];                               // tatemono slug e.g. inventory-management
        $slugNs    = EventBuilder::toNamespace($name);             // e.g. InventoryManagement
        $modelName = $module['api']['model'];
        $tableName = self::prefixedTable($name, $module['database']['table']);
        $db        = $module['database'];
        
        // FIXED: Use $slugNs for directory (namespace-safe), not $name
        $filePath  = app_path("Models/Arkzen/{$slugNs}/{$modelName}.php");
        $dbConn    = self::slugToConnection($name);

        File::ensureDirectoryExists(app_path("Models/Arkzen/{$slugNs}"));

        $fillable         = self::generateFillable($db['columns']);
        $casts            = self::generateCasts($db['columns']);
        $relations        = self::generateRelations($db['columns'], $module['databases'] ?? [], $module['database']['table'], $name, $slugNs, $module['apis'] ?? []);
        $softDeletes      = $db['softDeletes'] ? "use Illuminate\\Database\\Eloquent\\SoftDeletes;\n" : '';
        $softDeletesTrait = $db['softDeletes'] ? "\n    use SoftDeletes;" : '';

        $content = "<?php

// ============================================================
// ARKZEN GENERATED MODEL — {$modelName}
// Tatemono: {$name}
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: " . now()->toISOString() . "
// ============================================================

namespace App\Models\Arkzen\\{$slugNs};

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
{$softDeletes}
class {$modelName} extends Model
{
    use HasFactory;{$softDeletesTrait}

    protected \$connection = '{$dbConn}';

    protected \$table = '{$tableName}';

    protected \$fillable = [
{$fillable}
    ];

    protected \$casts = [
{$casts}
    ];

{$relations}
}
";

        File::put($filePath, $content);
        Log::info("[Arkzen Model] ✓ Model created: {$slugNs}/{$modelName}");
    }

    // ─────────────────────────────────────────────
    // TABLE PREFIX
    // inventory-management + inventories → inventory_management_inventories
    // ─────────────────────────────────────────────

    public static function prefixedTable(string $tatSlug, string $rawTable): string
    {
        $prefix = str_replace('-', '_', $tatSlug);
        if (str_starts_with($rawTable, $prefix . '_')) return $rawTable;
        return $prefix . '_' . $rawTable;
    }

    // ─────────────────────────────────────────────
    // CONNECTION NAME
    // inventory-management → inventory_management
    // ─────────────────────────────────────────────

    public static function slugToConnection(string $tatSlug): string
    {
        return str_replace('-', '_', $tatSlug);
    }

    // ─────────────────────────────────────────────
    // FILLABLE
    // ─────────────────────────────────────────────

    private static function generateFillable(array $columns): string
    {
        $fillable = [];
        foreach ($columns as $name => $config) {
            if (!empty($config['primary'])) continue;
            $fillable[] = "        '{$name}'";
        }
        return implode(",\n", $fillable);
    }

    // ─────────────────────────────────────────────
    // CASTS
    // ─────────────────────────────────────────────

    private static function generateCasts(array $columns): string
    {
        $castMap = [
            'boolean'    => 'boolean',
            'integer'    => 'integer',
            'bigInteger' => 'integer',
            'decimal'    => 'decimal:2',
            'float'      => 'float',
            'json'       => 'array',
            'date'       => 'date',
            'datetime'   => 'datetime',
            'timestamp'  => 'datetime',
        ];

        $casts = [];
        foreach ($columns as $name => $config) {
            $type = $config['type'] ?? 'string';
            if (isset($castMap[$type])) {
                $casts[] = "        '{$name}' => '{$castMap[$type]}'";
            }
        }
        return implode(",\n", $casts);
    }

    // ─────────────────────────────────────────────
    // RELATIONS
    // Uses slugNs (PascalCase) for namespace — no hyphens
    // ─────────────────────────────────────────────

    private static function generateRelations(array $columns, array $allDatabases, string $rawCurrentTable, string $tatSlug, string $slugNs, array $apis = []): string
    {
        $relations = [];

        // belongsTo — from foreign key columns on this model
        foreach ($columns as $name => $config) {
            if (empty($config['foreign'])) continue;

            [$refTable]   = explode('.', (string) $config['foreign']);
            $rawRefTable  = self::resolveRawTable($refTable, $tatSlug, $allDatabases);
            $relatedModel = self::modelForTable($rawRefTable, $apis);
            $methodName   = str_replace('_id', '', $name);

            $relations[] = "    public function {$methodName}()
    {
        return \$this->belongsTo(\\App\\Models\\Arkzen\\{$slugNs}\\{$relatedModel}::class, '{$name}');
    }";
        }

        // hasMany — detect other tables in same tatemono that foreign key into this one
        foreach ($allDatabases as $db) {
            if ($db['table'] === $rawCurrentTable) continue;

            foreach ($db['columns'] as $col => $cfg) {
                if (empty($cfg['foreign'])) continue;
                [$refTable] = explode('.', (string) $cfg['foreign']);

                if (self::resolveRawTable($refTable, $tatSlug, $allDatabases) === $rawCurrentTable) {
                    $relatedModel = self::modelForTable($db['table'], $apis);
                    $methodName   = self::pluralize(str_replace('_id', '', $col));

                    $relations[] = "    public function {$methodName}()
    {
        return \$this->hasMany(\\App\\Models\\Arkzen\\{$slugNs}\\{$relatedModel}::class, '{$col}');
    }";
                }
            }
        }

        return implode("\n\n", $relations);
    }

    // `foreign:` can be the declared table (employees) or the prefixed physical
    // name (queue_flow_queues). Resolve either one back to the declared table so
    // relations match the same way the migration does.
    private static function resolveRawTable(string $refTable, string $tatSlug, array $allDatabases): string
    {
        $declared = array_column($allDatabases, 'table');
        if (in_array($refTable, $declared, true)) return $refTable;

        $prefix = str_replace('-', '_', $tatSlug) . '_';
        if (str_starts_with($refTable, $prefix)) {
            $stripped = substr($refTable, strlen($prefix));
            if (in_array($stripped, $declared, true)) return $stripped;
        }

        return $refTable;
    }

    // Use the model class actually generated for a table (the api block's model),
    // using the same table <-> model matching as ModuleReader::findDatabaseForModel.
    // Only fall back to guessing the class name when no api block matches.
    private static function modelForTable(string $rawTable, array $apis): string
    {
        foreach ($apis as $api) {
            $model = $api['model'] ?? null;
            if (!$model) continue;

            $snake = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $model));
            if (
                strtolower($model) === rtrim($rawTable, 's')
                || $snake . 's' === $rawTable
                || $snake === $rawTable
            ) {
                return $model;
            }
        }

        return self::tableToModel($rawTable);
    }

    private static function tableToModel(string $table): string
    {
        if (str_ends_with($table, 'ies'))     $singular = substr($table, 0, -3) . 'y';
        elseif (str_ends_with($table, 'ss'))  $singular = $table;
        elseif (str_ends_with($table, 's'))   $singular = substr($table, 0, -1);
        else                                  $singular = $table;

        return str_replace('_', '', ucwords($singular, '_'));
    }

    private static function pluralize(string $word): string
    {
        if (str_ends_with($word, 'y')) return substr($word, 0, -1) . 'ies';
        if (str_ends_with($word, 's')) return $word . 'es';
        return $word . 's';
    }
}
