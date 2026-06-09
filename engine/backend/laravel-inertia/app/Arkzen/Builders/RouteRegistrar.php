<?php

// ============================================================
// ARKZEN ENGINE — ROUTE REGISTRAR v5.1
//
// v5.1: Fixed Sanctum token model isolation bug.
//       Sanctum::usePersonalAccessTokenModel() is a global static
//       setter. When written at the top level of a route file it
//       executes at include time — last file included wins,
//       silently overwriting every other tatemono's model for the
//       entire request. With multiple auth tatemonos loaded,
//       whichever module route file was included last determined
//       which PAT table ALL modules resolved against, causing 401s
//       on private/presence broadcasting/auth for any tatemono
//       that wasn't last.
//
//       Fix: wrap the setter in a Route::matched listener scoped
//       to this tatemono's prefix. It fires once per request,
//       only when a route from this tatemono is matched, so each
//       request gets the correct isolated PAT model regardless of
//       include order.
//
// v5.0: Consumes new MiddlewareBuilder::build() return shape.
// v4.6: Custom routes support added.
// v4.5: Sanctum token model bootstrap per route file.
// v4.4: Route parameters rewritten {id} → {modelVar}.
// ============================================================

namespace App\Arkzen\Builders;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use App\Providers\Arkzen\ArkzenServiceProvider;

class RouteRegistrar
{
    // ─────────────────────────────────────────────
    // BUILD ALL — one file, all resources + custom routes
    // ─────────────────────────────────────────────

    public static function buildAll(array $module): void
    {
        $name      = $module['name'];
        $slugNs    = EventBuilder::toNamespace($name);
        $hasAuth   = $module['auth'] ?? false;
        $apis      = $module['apis'];
        $routesDir = base_path('routes/modules');

        File::ensureDirectoryExists($routesDir);

        $routeFile       = "{$routesDir}/{$name}.php";
        $useStatements   = [];
        $routeGroups     = [];
        $allAliases      = [];   // collected across all APIs: ['role' => FQCN, ...]
        $middlewareUses  = [];   // collected use lines for scoped middleware classes

        // ── Resource API routes ───────────────────
        foreach ($apis as $api) {
            $controllerName = $api['controller'];
            $prefix         = $api['prefix'];

            $useStatements[] = "use App\\Http\\Controllers\\Arkzen\\{$slugNs}\\{$controllerName};";

            // v5.0: build() now returns ['middleware', 'aliases', 'useLines']
            $mwResult = MiddlewareBuilder::build([
                'api'                => $api,
                'name'               => $name,
                'databases'          => $module['databases'],
                'apis'               => $apis,
                'middlewareSnippets' => $module['middlewareSnippets'] ?? [],
            ]);

            $resolvedMiddleware = $mwResult['middleware'];
            $middlewareStr      = "['" . implode("', '", $resolvedMiddleware) . "']";
            $routeLines         = self::generateRouteLines($controllerName, $api['endpoints'], $api['model']);

            // Collect aliases and use lines from this API
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

        // ── Custom routes — v4.6 ─────────────────
        foreach (($module['customRoutes'] ?? []) as $cr) {
            $controllerName  = $cr['controller'];
            $useStatements[] = "use App\\Http\\Controllers\\Arkzen\\{$slugNs}\\{$controllerName};";

            $middleware    = !empty($cr['middleware']) ? $cr['middleware'] : ['api'];
            $middlewareStr = "['" . implode("', '", $middleware) . "']";

            $lines = [];
            foreach ($cr['routes'] as $r) {
                $httpMethod = strtolower($r['method']);
                $route      = ltrim($r['route'], '/');
                $handler    = $r['handler'];
                $lines[]    = "        Route::{$httpMethod}('{$route}', [{$controllerName}::class, '{$handler}']);";
            }

            $linesBlock    = implode("\n", $lines);
            $routeGroups[] = "// ── Custom: {$controllerName} ─────────────────────────────\n"
                . "Route::middleware({$middlewareStr})\n"
                . "    ->group(function () {\n"
                . "{$linesBlock}\n"
                . "    });";
        }

        // ── Assemble use block ────────────────────
        // Controller use statements + scoped middleware use statements
        $allUseStatements = array_unique(array_merge($useStatements, $middlewareUses));
        $useBlock         = implode("\n", $allUseStatements);
        $groupsBlock      = implode("\n\n", $routeGroups);

        // ── Sanctum bootstrap (auth:true tatemonos) ───────────────────────
        // v5.1 FIX: Moved from bare top-level call to a Route::matched listener
        // scoped to this tatemono's URL prefix (/api/{name}/).
        //
        // WHY: Sanctum::usePersonalAccessTokenModel() is a global static setter.
        // At top-level, all route files run at include time — last file wins and
        // overwrites every other module's PAT model for the whole request. Under
        // Route::matched, it only fires when this module's route is actually
        // dispatched, ensuring the correct isolated PAT table is used per-request.
        $sanctumBootstrap = '';
        if ($hasAuth) {
            $sanctumBootstrap = "\nuse Laravel\\Sanctum\\Sanctum;\n"
                . "use App\\Models\\Arkzen\\{$slugNs}\\PersonalAccessToken as {$slugNs}Token;\n\n"
                . "// v5.1: Scoped per-request — fires only when a route under /api/{$name}/ is matched.\n"
                . "// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition\n"
                . "// where the last-loaded route file would override all other tatemonos' PAT models.\n"
                . "\\Illuminate\\Support\\Facades\\Route::matched(function (\\Illuminate\\Routing\\Events\\RouteMatched \$event) {\n"
                . "    \$uri = \$event->request->path();\n"
                . "    if (str_starts_with(\$uri, 'api/{$name}/')) {\n"
                . "        \\Laravel\\Sanctum\\Sanctum::usePersonalAccessTokenModel({$slugNs}Token::class);\n"
                . "    }\n"
                . "});\n";
        }

        // ── Scoped middleware alias bootstrap ─────────────────────
        // Registers per-tatemono middleware aliases (e.g. 'role') directly
        // in the route file so no global app.php registration is needed.
        // This is the same localised-bootstrap pattern as Sanctum above.
        $aliasBootstrap = '';
        if (!empty($allAliases)) {
            $aliasLines = [];
            foreach ($allAliases as $aliasKey => $fqcn) {
                // aliasMiddleware($name, $class) takes two separate args — not an array
                $aliasLines[] = "app('router')->aliasMiddleware('{$aliasKey}', \\{$fqcn}::class);";
            }
            $aliasBootstrap = "\n// ── Scoped middleware aliases for this tatemono ────────────\n"
                . implode("\n", $aliasLines) . "\n";
        }

        $content = "<?php

// ============================================================
// ARKZEN GENERATED ROUTES — {$name}
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
        Log::info("[Arkzen Routes] ✓ Route file created: routes/modules/{$name}.php");

        ArkzenServiceProvider::registerModuleRoutes($name);
        Log::info("[Arkzen Routes] ✓ Routes registered for: {$name}");
    }

    // ─────────────────────────────────────────────
    // GENERATE ROUTE LINES FOR ONE RESOURCE
    // ─────────────────────────────────────────────

    private static function generateRouteLines(string $controller, array $endpoints, string $model): string
    {
        $lines    = [];
        $modelVar = lcfirst($model); // Item → item, EventLog → eventLog

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

    // ─────────────────────────────────────────────
    // REMOVE
    // ─────────────────────────────────────────────

    public static function remove(string $moduleName): void
    {
        $routeFile = base_path("routes/modules/{$moduleName}.php");

        if (File::exists($routeFile)) {
            File::delete($routeFile);
            Log::info("[Arkzen Routes] ✓ Route file removed: {$moduleName}");
        }
    }
}