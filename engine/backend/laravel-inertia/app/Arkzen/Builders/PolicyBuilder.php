<?php

// ============================================================
// ARKZEN ENGINE — POLICY BUILDER v6.0
// v6.0: Body injection + auto-wire to controller
//       - Accepts policySnippets (methodName → base64 PHP)
//       - Generates methods with injected bodies or auto-detection
//       - Returns authorization rules for controller wiring
// v5.3: Namespace-safe folder names
// ============================================================

namespace App\Arkzen\Builders;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class PolicyBuilder
{
    public static function build(array $module): void
    {
        $api    = $module['api'];
        $db     = $module['database'];
        $name   = $module['name'];
        $slugNs = EventBuilder::toNamespace($name);

        if (empty($api['policy'])) return;

        $modelName      = $api['model'];
        $policyName     = "{$modelName}Policy";
        $policySnippets = $module['policySnippets'] ?? [];
        
        $filePath = app_path("Policies/Arkzen/{$slugNs}/{$policyName}.php");
        File::ensureDirectoryExists(app_path("Policies/Arkzen/{$slugNs}"));

        $ownerColumn = self::detectOwnerColumn($db['columns'] ?? []);
        $varName     = self::varName($modelName);
        
        $methods = self::generateMethods($modelName, $varName, $ownerColumn, $policySnippets);

        $content = "<?php

// ============================================================
// ARKZEN GENERATED POLICY — {$policyName}
// Tatemono: {$name}
// v6.0: Methods may include injected logic from @arkzen:policy:methodName blocks
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: " . now()->toISOString() . "
// ============================================================

namespace App\Policies\Arkzen\\{$slugNs};

use App\Models\User;
use App\Models\Arkzen\\{$slugNs}\\{$modelName};
use Illuminate\Auth\Access\HandlesAuthorization;

class {$policyName}
{
    use HandlesAuthorization;

{$methods}
}
";

        File::put($filePath, $content);
        Log::info("[Arkzen Policy] ✓ Policy created: {$slugNs}/{$policyName}");
    }

    private static function generateMethods(string $modelName, string $varName, ?string $ownerColumn, array $policySnippets): string
    {
        $methods = [];
        
        $methods[] = "    public function viewAny(?User \$user): bool { return true; }";
        $methods[] = "    public function view(?User \$user, {$modelName} \${$varName}): bool { return true; }";
        $methods[] = "    public function create(?User \$user): bool { return true; }";
        
        $methods[] = self::generateUpdateMethod($modelName, $varName, $ownerColumn, $policySnippets);
        $methods[] = self::generateDeleteMethod($modelName, $varName, $ownerColumn, $policySnippets);
        
        return implode("\n\n", $methods);
    }

    private static function generateUpdateMethod(string $modelName, string $varName, ?string $ownerColumn, array $policySnippets): string
    {
        $bodyEncoded = $policySnippets['update'] ?? null;
        $body = $bodyEncoded ? base64_decode($bodyEncoded) : null;

        if ($body && trim($body) !== '') {
            $methodBody = self::indentBody(trim($body), 2);
        } else {
            $ownerCheck = $ownerColumn
                ? "\$user?->id === \${$varName}->{$ownerColumn}"
                : 'false';
            $adminCheck = "\$user?->role === 'admin'";
            $methodBody = "        return ({$ownerCheck}) || ({$adminCheck});";
        }

        return "    public function update(?User \$user, {$modelName} \${$varName}): bool
    {
{$methodBody}
    }";
    }

    private static function generateDeleteMethod(string $modelName, string $varName, ?string $ownerColumn, array $policySnippets): string
    {
        $bodyEncoded = $policySnippets['delete'] ?? null;
        $body = $bodyEncoded ? base64_decode($bodyEncoded) : null;

        if ($body && trim($body) !== '') {
            $methodBody = self::indentBody(trim($body), 2);
        } else {
            $ownerCheck = $ownerColumn
                ? "\$user?->id === \${$varName}->{$ownerColumn}"
                : 'false';
            $adminCheck = "\$user?->role === 'admin'";
            $methodBody = "        return ({$ownerCheck}) || ({$adminCheck});";
        }

        return "    public function delete(?User \$user, {$modelName} \${$varName}): bool
    {
{$methodBody}
    }";
    }

    private static function indentBody(string $body, int $indentLevel): string
    {
        $lines = explode("\n", $body);
        $indent = str_repeat(" ", $indentLevel * 4);
        return implode("\n", array_map(fn($l) => $indent . $l, $lines));
    }

    private static function detectOwnerColumn(array $columns): ?string
    {
        foreach (['user_id', 'owner_id', 'created_by', 'author_id'] as $col) {
            if (isset($columns[$col])) return $col;
        }
        return null;
    }

    private static function varName(string $modelName): string { return lcfirst($modelName); }
}