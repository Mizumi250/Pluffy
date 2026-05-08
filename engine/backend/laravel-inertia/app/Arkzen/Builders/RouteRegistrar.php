<?php

// ============================================================
// ARKZEN ENGINE — INERTIA ROUTE REGISTRAR v1.0
// Forked from RouteRegistrar for the react-inertia stack.
//
// KEY DIFFERENCE from decoupled RouteRegistrar:
//   - Routes use 'web' middleware group (not 'api')
//   - Inertia pages are served as GET routes (Laravel renders HTML)
//   - Mutation routes (POST/PUT/PATCH/DELETE) redirect back
//   - Custom routes default to 'web' middleware (not 'api')
//   - ArkzenServiceProvider::registerModuleRoutes() registers
//     under web middleware here instead of api
//
// Everything else (sanctum bootstrap, alias bootstrap, custom
// routes, file structure) is IDENTICAL to decoupled version.
// ============================================================

namespace App\Arkzen\Builders;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use App\Providers\Arkzen\ArkzenServiceProvider;

class RouteRegistrar
{
    public static function buildAll(array $module): void
    {
        $name      = $module['name'];
        $slugNs    = EventBuilder::toNamespace($name);
        $hasAuth   = $module['auth'] ?? false;
        $apis      = $module['apis'];
        $routesDir = base_path('routes/modules');

        File::ensureDirectoryExists($routesDir);

        $routeFile      = "{$routesDir}/{$name}.php";
        $useStatements  = [];
        $routeGroups    = [];
        $allAliases     = [];
        $middlewareUses = [];

        // ── Inertia page routes ───────────────────
        // One GET route per page — Laravel serves the Inertia SPA shell
        $pageLines = [];
        foreach (($module['pages'] ?? []) as $page) {
            $pageName      = $page['name'];
            $pageNamespace = self::tatNameToPageName($name);
            $pagePascal    = self::tatNameToPageName($pageName);
            $routePath     = $pageName === 'index' ? "/{$name}" : "/{$name}/{$pageName}";
            $pageLines[]   = "    // Page: {$pageName}";
            $pageLines[]   = "    Route::get('{$routePath}', function () {";
            $pageLines[]   = "        return \\Inertia\\Inertia::render('{$pageNamespace}/{$pagePascal}');";
            $pageLines[]   = "    });";
            $pageLines[]   = '';
        }
        if (!empty($pageLines)) {
            $routeGroups[] = "// ── Inertia Pages ─────────────────────────────\n"
                . "Route::middleware(['web'])\n"
                . "    ->group(function () {\n"
                . implode("\n", $pageLines)
                . "    });";
        }

        // ── Resource API routes ───────────────────
        foreach ($apis as $api) {
            $controllerName = $api['controller'];
            // Keep the /api/ prefix — frontend calls this path regardless of middleware
            // Use 'web' middleware instead of 'api', but preserve the route path
            $prefix         = $api['prefix'];
            $useStatements[] = "use App\\Http\\Controllers\\Arkzen\\{$slugNs}\\{$controllerName};";

            $mwResult = MiddlewareBuilder::build([
                'api'                => $api,
                'name'               => $name,
                'databases'          => $module['databases'],
                'apis'               => $apis,
                'middlewareSnippets' => $module['middlewareSnippets'] ?? [],
            ]);

            // Replace 'api' middleware with 'web' for Inertia
            $resolvedMiddleware = array_map(
                fn($mw) => $mw === 'api' ? 'web' : $mw,
                $mwResult['middleware']
            );

            $middlewareStr  = "['" . implode("', '", $resolvedMiddleware) . "']";
            $routeLines     = self::generateRouteLines($controllerName, $api['endpoints'], $api['model']);

            if (!empty($mwResult['aliases'])) {
                $allAliases = array_merge($allAliases, $mwResult['aliases']);
            }
            if (!empty($mwResult['useLines'])) {
                $middlewareUses = array_merge($middlewareUses, $mwResult['useLines']);
            }

            $routeGroups[] = "// ── {$api['model']} ─────────────────────────────\n"
                . "Route::middleware({$middlewareStr})\n"
                . "    ->prefix('{$prefix}')\n"
                . "    ->group(function () {\n\n"
                . "{$routeLines}\n"
                . "    });";
        }

        // ── Custom routes ─────────────────────────
        foreach (($module['customRoutes'] ?? []) as $cr) {
            $controllerName  = $cr['controller'];
            $useStatements[] = "use App\\Http\\Controllers\\Arkzen\\{$slugNs}\\{$controllerName};";

            // Default to web middleware for Inertia custom routes
            $middleware    = !empty($cr['middleware']) ? $cr['middleware'] : ['web'];
            $middleware    = array_map(fn($mw) => $mw === 'api' ? 'web' : $mw, $middleware);
            $middlewareStr = "['" . implode("', '", $middleware) . "']";

            $lines = [];
            foreach ($cr['routes'] as $r) {
                $httpMethod = strtolower($r['method']);
                $route      = ltrim($r['route'], '/');
                $handler    = $r['handler'];
                $lines[]    = "    Route::{$httpMethod}('{$route}', [{$controllerName}::class, '{$handler}']);";
            }

            $routeGroups[] = "// ── Custom: {$controllerName} ─────────────────────────────\n"
                . "Route::middleware({$middlewareStr})\n"
                . "    ->group(function () {\n"
                . implode("\n", $lines) . "\n"
                . "    });";
        }

        // ── Assemble file ─────────────────────────
        $uniqueUseStatements = array_unique(array_merge($useStatements, $middlewareUses));
        sort($uniqueUseStatements);
        $useBlock    = implode("\n", $uniqueUseStatements);
        $groupsBlock = implode("\n\n", $routeGroups);

        // Sanctum bootstrap — same as decoupled (Inertia still uses Sanctum sessions)
        $sanctumBootstrap = '';
        if ($hasAuth) {
            $sanctumBootstrap = "\nuse Laravel\\Sanctum\\Sanctum;\n"
                . "use App\\Models\\Arkzen\\{$slugNs}\\PersonalAccessToken as {$slugNs}Token;\n\n"
                . "Sanctum::usePersonalAccessTokenModel({$slugNs}Token::class);\n";
        }

        // Scoped middleware alias bootstrap
        $aliasBootstrap = '';
        if (!empty($allAliases)) {
            $aliasLines = [];
            foreach ($allAliases as $aliasKey => $fqcn) {
                $aliasLines[] = "app('router')->aliasMiddleware('{$aliasKey}', \\{$fqcn}::class);";
            }
            $aliasBootstrap = "\n// ── Scoped middleware aliases for this tatemono ────────────\n"
                . implode("\n", $aliasLines) . "\n";
        }

        $content = "<?php

// ============================================================
// ARKZEN GENERATED ROUTES — {$name} [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: " . now()->toISOString() . "
// Resources: " . implode(', ', array_column($apis, 'model')) . "
// Custom controllers: " . implode(', ', array_column($module['customRoutes'] ?? [], 'controller')) . "
// ============================================================

use Illuminate\\Support\\Facades\\Route;
{$useBlock}
{$sanctumBootstrap}{$aliasBootstrap}
{$groupsBlock}
";

        File::put($routeFile, $content);
        Log::info("[Arkzen Inertia Routes] ✓ Route file created: routes/modules/{$name}.php");

        ArkzenServiceProvider::registerModuleRoutes($name);
        Log::info("[Arkzen Inertia Routes] ✓ Routes registered for: {$name}");
    }

    // ─────────────────────────────────────────────
    // REMOVE
    // ─────────────────────────────────────────────

    public static function remove(string $name): void
    {
        $routeFile = base_path("routes/modules/{$name}.php");
        if (File::exists($routeFile)) {
            File::delete($routeFile);
            Log::info("[Arkzen Inertia Routes] ✓ Route file removed: {$name}");
        }
    }

    // ─────────────────────────────────────────────
    // GENERATE ROUTE LINES — identical to decoupled
    // ─────────────────────────────────────────────

    private static function tatNameToPageName(string $tatName): string
    {
        return str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $tatName)));
    }

    private static function generateRouteLines(string $controller, array $endpoints, string $model): string
    {
        $lines    = [];
        $modelVar = lcfirst($model);

        $methodMap = [
            'GET'    => 'get',
            'POST'   => 'post',
            'PUT'    => 'put',
            'PATCH'  => 'patch',
            'DELETE' => 'delete',
        ];

        foreach ($endpoints as $name => $endpoint) {
            $httpMethod  = strtoupper($endpoint['method']);
            $routeMethod = $methodMap[$httpMethod] ?? 'get';
            $route       = preg_replace('/\{id\}/', '{' . $modelVar . '}', $endpoint['route']);
            $description = $endpoint['description'] ?? $name;

            $lines[] = "        // {$description}";
            $lines[] = "        Route::{$routeMethod}('{$route}', [{$controller}::class, '{$name}']);";
            $lines[] = '';
        }

        return implode("\n", $lines);
    }
}