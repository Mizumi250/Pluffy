<?php

// ============================================================
// ARKZEN ENGINE — INERTIA CONTROLLER BUILDER v1.0
// Forked from ControllerBuilder v5.8 for the react-inertia stack.
//
// KEY DIFFERENCE from decoupled ControllerBuilder:
//   index()   → Inertia::render('TatName/PageName', ['items' => ...])
//   show()    → Inertia::render('TatName/Show',     ['item'  => ...])
//   store()   → redirect()->back()->with('success', '...')
//   update()  → redirect()->back()->with('success', '...')
//   destroy() → redirect()->back()->with('success', '...')
//
// Mutation responses use redirect()->back() so Inertia re-fetches
// the current page with fresh props — the correct Inertia pattern.
//
// Everything else (uploads, jobs, events, mail, notifications,
// broadcasts, custom methods) is IDENTICAL to decoupled version —
// those are fire-and-forget actions that already redirect or return
// a simple status, so they work the same in both stacks.
// ============================================================

namespace App\Arkzen\Builders;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class ControllerBuilder
{
    private static string $validationTatSlug    = '';
    private static string $validationConnection = '';
    /** @var string[] */
    private static array $validationTables = [];

    public static function build(array $module): void
    {
        $api            = $module['api'];
        $name           = $module['name'];
        $slugNs         = EventBuilder::toNamespace($name);
        $controllerName = $api['controller'];
        $modelName      = $api['model'];
        $endpoints      = $api['endpoints'];
        $useResource    = $api['resource'] ?? false;

        self::$validationTatSlug    = $name;
        self::$validationConnection = ModelBuilder::slugToConnection($name);
        self::$validationTables     = self::extractValidationTables($module);

        $filePath = app_path("Http/Controllers/Arkzen/{$slugNs}/{$controllerName}.php");
        File::ensureDirectoryExists(app_path("Http/Controllers/Arkzen/{$slugNs}"));

        $isNativeNotifications = collect($endpoints)->contains(
            fn($e) => ($e['type'] ?? '') === 'notification_trigger'
        );

        $methods = $isNativeNotifications
            ? self::generateNativeNotificationMethods($endpoints, $slugNs)
            : self::generateMethods($modelName, $endpoints, $slugNs, $useResource, $name);

        $resourceImport = $useResource
            ? "use App\\Http\\Resources\\Arkzen\\{$slugNs}\\{$modelName}Resource;\n"
            : '';

        $content = "<?php

namespace App\Http\Controllers\Arkzen\\{$slugNs};

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
{$resourceImport}
class {$controllerName} extends Controller
{
{$methods}
}
";

        File::put($filePath, $content);
        Log::info("[Arkzen Inertia Controller] ✓ Controller created: {$slugNs}/{$controllerName}");
    }

    // ─────────────────────────────────────────────
    // GENERATE METHODS
    // ─────────────────────────────────────────────

    private static function generateMethods(
        string $modelName,
        array $endpoints,
        string $slugNs,
        bool $useResource,
        string $tatName
    ): string {
        $methods = [];
        foreach ($endpoints as $name => $endpoint) {
            $methods[] = self::generateMethod($name, $modelName, $endpoint, $slugNs, $useResource, $tatName);
        }
        return implode("\n\n", $methods);
    }

    private static function generateMethod(
        string $name,
        string $modelName,
        array $endpoint,
        string $slugNs,
        bool $useResource,
        string $tatName
    ): string {
        return match ($name) {
            'index'   => match ($endpoint['type'] ?? '') {
                'upload_index' => self::generateUploadIndex($modelName, $endpoint),
                default        => self::generateIndex($modelName, $endpoint, $slugNs, $useResource, $tatName),
            },
            'show'    => self::generateShow($modelName, $endpoint, $slugNs, $useResource, $tatName),
            'update'  => self::generateUpdate($modelName, $endpoint, $slugNs, $useResource),
            'store'   => match ($endpoint['type'] ?? '') {
                'upload'               => self::generateUploadStore($modelName, $endpoint),
                'command_run'          => self::generateCommandRun($modelName, $endpoint),
                'job_dispatch'         => self::generateJobDispatch($modelName, $endpoint),
                'event_fire'           => self::generateEventFire($modelName, $endpoint),
                'broadcast'            => self::generateBroadcast($modelName, $slugNs, $endpoint),
                'mail_send'            => self::generateMailSend($modelName, $endpoint, $slugNs),
                'notification_trigger' => self::generateNotificationTrigger($modelName, $endpoint, $slugNs),
                default                => self::generateStore($modelName, $endpoint, $slugNs, $useResource),
            },
            'destroy' => match ($endpoint['type'] ?? '') {
                'upload_destroy' => self::generateUploadDestroy($modelName, $endpoint),
                default          => self::generateDestroy($modelName, $endpoint),
            },
            'fileUrl'   => self::generateUploadUrl($modelName, $endpoint),
            'me'        => self::generateCustomMethod($name, $modelName, $endpoint),
            'adminOnly' => self::generateRoleAdminOnly($modelName, $endpoint),
            'userOnly'  => self::generateRoleUserOnly($modelName, $endpoint),
            'promote'   => self::generateRolePromote($endpoint),
            'demote'    => self::generateRoleDemote($endpoint),
            'run'       => self::generateCommandRun($modelName, $endpoint),
            default     => self::generateCustomMethod($name, $modelName, $endpoint),
        };
    }

    // ─────────────────────────────────────────────
    // INDEX — Inertia::render() with paginated data
    // ─────────────────────────────────────────────

    private static function generateIndex(
        string $model,
        array $endpoint,
        string $slugNs,
        bool $useResource,
        string $tatName
    ): string {
        $query        = $endpoint['query'] ?? [];
        $searchFields = self::detectSearchFields($query);
        $perPage      = self::extractDefault($query['per_page'] ?? 'integer|default:15');
        $pageName     = self::tatNameToPageName($tatName);   // inventory-management → InventoryManagement
        $varName      = lcfirst($model);

        $searchLogic = '';
        if ($searchFields) {
            $searchLogic = "\n        if (\$request->filled('search')) {\n            \$query->where(function (\$q) use (\$request) {\n                "
                . implode("\n                ", array_map(
                    fn($f) => "\$q->orWhere('{$f}', 'like', '%' . \$request->search . '%');",
                    $searchFields
                ))
                . "\n            });\n        }";
        }

        $filterLogic = self::generateFilterLogic($query);

        $dataExpr = $useResource
            ? "{$model}Resource::collection(\$results)->toArray(\$request)"
            : "\$results->toArray()";

        return "    /**
     * {$endpoint['description']}
     */
    public function index(Request \$request): InertiaResponse
    {
        \$query = {$model}::query();
{$searchLogic}
{$filterLogic}
        \$perPage = \$request->get('per_page', {$perPage});
        \$results = \$query->paginate(\$perPage);

        return Inertia::render('{$pageName}/Index', [
            '{$varName}s' => {$dataExpr},
        ]);
    }";
    }

    // ─────────────────────────────────────────────
    // SHOW — Inertia::render() with single record
    // ─────────────────────────────────────────────

    private static function generateShow(
        string $model,
        array $endpoint,
        string $slugNs,
        bool $useResource,
        string $tatName
    ): string {
        $varName  = lcfirst($model);
        $pageName = self::tatNameToPageName($tatName);

        $dataExpr = $useResource
            ? "(new {$model}Resource(\${$varName}))->toArray(request())"
            : "\${$varName}->toArray()";

        return "    /**
     * {$endpoint['description']}
     */
    public function show({$model} \${$varName}): InertiaResponse
    {
        return Inertia::render('{$pageName}/Show', [
            '{$varName}' => {$dataExpr},
        ]);
    }";
    }

    // ─────────────────────────────────────────────
    // STORE — redirect()->back() with flash
    // ─────────────────────────────────────────────

    private static function generateStore(
        string $model,
        array $endpoint,
        string $slugNs,
        bool $useResource
    ): string {
        $validation = self::generateValidation($endpoint['validation'] ?? []);
        $varName    = lcfirst($model);
        $message    = $endpoint['response']['value'] ?? "{$model} created successfully";

        return "    /**
     * {$endpoint['description']}
     */
    public function store(Request \$request): RedirectResponse
    {
        \$validated = \$request->validate([
{$validation}
        ]);

        {$model}::create(\$validated);

        return redirect()->back()->with('success', '{$message}');
    }";
    }

    // ─────────────────────────────────────────────
    // UPDATE — redirect()->back() with flash
    // ─────────────────────────────────────────────

    private static function generateUpdate(
        string $model,
        array $endpoint,
        string $slugNs,
        bool $useResource
    ): string {
        $validation = self::generateValidation($endpoint['validation'] ?? []);
        $varName    = lcfirst($model);
        $message    = $endpoint['response']['value'] ?? "{$model} updated successfully";

        return "    /**
     * {$endpoint['description']}
     */
    public function update(Request \$request, {$model} \${$varName}): RedirectResponse
    {
        \$validated = \$request->validate([
{$validation}
        ]);

        \${$varName}->update(\$validated);

        return redirect()->back()->with('success', '{$message}');
    }";
    }

    // ─────────────────────────────────────────────
    // DESTROY — redirect()->back() with flash
    // ─────────────────────────────────────────────

    private static function generateDestroy(string $model, array $endpoint): string
    {
        $varName = lcfirst($model);
        $message = $endpoint['response']['value'] ?? "{$model} deleted successfully";

        return "    /**
     * {$endpoint['description']}
     */
    public function destroy({$model} \${$varName}): RedirectResponse
    {
        \${$varName}->delete();

        return redirect()->back()->with('success', '{$message}');
    }";
    }

    // ─────────────────────────────────────────────
    // HELPER — convert tatemono slug to PascalCase page namespace
    // inventory-management → InventoryManagement
    // ─────────────────────────────────────────────

    private static function tatNameToPageName(string $tatName): string
    {
        return str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $tatName)));
    }

    // ─────────────────────────────────────────────
    // EVERYTHING BELOW is IDENTICAL to decoupled
    // ControllerBuilder — uploads, jobs, events,
    // mail, notifications, broadcasts, roles, custom
    // ─────────────────────────────────────────────

    private static function generateUploadIndex(string $model, array $endpoint): string
    {
        $varName = lcfirst($model);
        return "    /**
     * {$endpoint['description']}
     */
    public function index(Request \$request): \\Inertia\\Response
    {
        \$files = \\Illuminate\\Support\\Facades\\Storage::disk('public')->files('{$varName}s');
        \$urls  = array_map(fn(\$f) => \\Illuminate\\Support\\Facades\\Storage::disk('public')->url(\$f), \$files);

        return Inertia::render('" . self::tatNameToPageName($model) . "/Index', [
            'files' => \$urls,
        ]);
    }";
    }

    private static function generateUploadStore(string $model, array $endpoint): string
    {
        $varName = lcfirst($model);
        return "    /**
     * {$endpoint['description']}
     */
    public function store(Request \$request): RedirectResponse
    {
        \$request->validate(['file' => 'required|file|max:10240']);
        \$path = \$request->file('file')->store('{$varName}s', 'public');

        return redirect()->back()->with('success', 'File uploaded: ' . basename(\$path));
    }";
    }

    private static function generateUploadDestroy(string $model, array $endpoint): string
    {
        $varName = lcfirst($model);
        return "    /**
     * {$endpoint['description']}
     */
    public function destroy(Request \$request): RedirectResponse
    {
        \$path = '{$varName}s/' . \$request->input('filename');
        \\Illuminate\\Support\\Facades\\Storage::disk('public')->delete(\$path);

        return redirect()->back()->with('success', 'File deleted');
    }";
    }

    private static function generateUploadUrl(string $model, array $endpoint): string
    {
        $varName = lcfirst($model);
        return "    /**
     * {$endpoint['description']}
     */
    public function fileUrl(Request \$request): \\Illuminate\\Http\\JsonResponse
    {
        \$filename = \$request->input('filename');
        \$url      = \\Illuminate\\Support\\Facades\\Storage::disk('public')->url('{$varName}s/' . \$filename);

        return response()->json(['url' => \$url]);
    }";
    }

    private static function generateJobDispatch(string $model, array $endpoint): string
    {
        $jobClass = $endpoint['job'] ?? $model . 'Job';
        return "    /**
     * {$endpoint['description']}
     */
    public function store(Request \$request): RedirectResponse
    {
        \\App\\Jobs\\Arkzen\\{$jobClass}::dispatch(\$request->all());

        return redirect()->back()->with('success', 'Job dispatched');
    }";
    }

    private static function generateEventFire(string $model, array $endpoint): string
    {
        $eventClass = $endpoint['event'] ?? $model . 'Event';
        return "    /**
     * {$endpoint['description']}
     */
    public function store(Request \$request): RedirectResponse
    {
        event(new \\App\\Events\\Arkzen\\{$eventClass}(\$request->all()));

        return redirect()->back()->with('success', 'Event fired');
    }";
    }

    private static function generateBroadcast(string $model, string $slugNs, array $endpoint): string
    {
        $channel   = $endpoint['channel']   ?? 'general';
        $eventName = $endpoint['eventName'] ?? $model . 'Broadcast';
        return "    /**
     * {$endpoint['description']}
     */
    public function store(Request \$request): RedirectResponse
    {
        broadcast(new \\App\\Events\\Arkzen\\{$slugNs}\\{$eventName}(\$request->all()))->toOthers();

        return redirect()->back()->with('success', 'Broadcast sent');
    }";
    }

    private static function generateMailSend(string $model, array $endpoint, string $slugNs): string
    {
        $mailClass = $endpoint['mail'] ?? $model . 'Mail';
        return "    /**
     * {$endpoint['description']}
     */
    public function store(Request \$request): RedirectResponse
    {
        \$user = \$request->user();
        \\Illuminate\\Support\\Facades\\Mail::to(\$user->email)
            ->send(new \\App\\Mail\\Arkzen\\{$slugNs}\\{$mailClass}(\$request->all()));

        return redirect()->back()->with('success', 'Mail sent');
    }";
    }

    private static function generateNotificationTrigger(string $model, array $endpoint, string $slugNs): string
    {
        $notifClass = $endpoint['notification'] ?? $model . 'Notification';
        return "    /**
     * {$endpoint['description']}
     */
    public function store(Request \$request): RedirectResponse
    {
        \$user = \$request->user();
        \$user->notify(new \\App\\Notifications\\Arkzen\\{$slugNs}\\{$notifClass}(\$request->all()));

        return redirect()->back()->with('success', 'Notification sent');
    }";
    }

    private static function generateNativeNotificationMethods(array $endpoints, string $slugNs): string
    {
        $methods = [];
        foreach ($endpoints as $name => $endpoint) {
            $methods[] = match ($name) {
                'index'   => "    public function index(Request \$request): \\Inertia\\Response\n    {\n        return Inertia::render('Notifications/Index', [\n            'notifications' => \$request->user()->notifications()->paginate(20)->toArray(),\n        ]);\n    }",
                'destroy' => "    public function destroy(Request \$request, string \$id): RedirectResponse\n    {\n        \$request->user()->notifications()->find(\$id)?->markAsRead();\n        return redirect()->back()->with('success', 'Notification marked as read');\n    }",
                'store'   => self::generateNotificationTrigger('Notification', $endpoint, $slugNs),
                default   => self::generateCustomMethod($name, 'Notification', $endpoint),
            };
        }
        return implode("\n\n", $methods);
    }

    private static function generateCommandRun(string $model, array $endpoint): string
    {
        $command = $endpoint['command'] ?? 'inspire';
        return "    /**
     * {$endpoint['description']}
     */
    public function store(Request \$request): RedirectResponse
    {
        \$exitCode = \\Illuminate\\Support\\Facades\\Artisan::call('{$command}');
        \$output   = \\Illuminate\\Support\\Facades\\Artisan::output();

        return redirect()->back()->with('success', \"Command '{$command}' exited with code {\$exitCode}\");
    }";
    }

    private static function generateCustomMethod(string $name, string $model, array $endpoint): string
    {
        $body    = isset($endpoint['body']) ? base64_decode($endpoint['body']) : null;
        $method  = strtolower($endpoint['method'] ?? 'get');
        $hasBody = in_array($method, ['post', 'put', 'patch']);

        if ($body) {
            $returnType = $hasBody ? 'RedirectResponse' : '\\Inertia\\Response';
            return "    /**\n     * {$endpoint['description']}\n     */\n    public function {$name}(Request \$request): {$returnType}\n    {\n        {$body}\n    }";
        }

        if ($hasBody) {
            return "    /**\n     * {$endpoint['description']}\n     */\n    public function {$name}(Request \$request): RedirectResponse\n    {\n        // TODO: implement {$name}\n        return redirect()->back()->with('success', '{$name} completed');\n    }";
        }

        return "    /**\n     * {$endpoint['description']}\n     */\n    public function {$name}(Request \$request): \\Inertia\\Response\n    {\n        // TODO: implement {$name}\n        return Inertia::render('" . self::tatNameToPageName($model) . "/" . ucfirst($name) . "', []);\n    }";
    }

    private static function generateRoleAdminOnly(string $model, array $endpoint): string
    {
        return "    public function adminOnly(Request \$request): \\Inertia\\Response\n    {\n        return Inertia::render('" . self::tatNameToPageName($model) . "/AdminOnly', [\n            'user' => \$request->user(),\n        ]);\n    }";
    }

    private static function generateRoleUserOnly(string $model, array $endpoint): string
    {
        return "    public function userOnly(Request \$request): \\Inertia\\Response\n    {\n        return Inertia::render('" . self::tatNameToPageName($model) . "/UserOnly', [\n            'user' => \$request->user(),\n        ]);\n    }";
    }

    private static function generateRolePromote(array $endpoint): string
    {
        return "    public function promote(Request \$request): RedirectResponse\n    {\n        \$user = \\App\\Models\\User::findOrFail(\$request->input('user_id'));\n        \$user->update(['role' => 'admin']);\n        return redirect()->back()->with('success', 'User promoted to admin');\n    }";
    }

    private static function generateRoleDemote(array $endpoint): string
    {
        return "    public function demote(Request \$request): RedirectResponse\n    {\n        \$user = \\App\\Models\\User::findOrFail(\$request->input('user_id'));\n        \$user->update(['role' => 'user']);\n        return redirect()->back()->with('success', 'User demoted to user');\n    }";
    }

    // ─────────────────────────────────────────────
    // SHARED HELPERS — identical to decoupled version
    // ─────────────────────────────────────────────

    private static function generateValidation(array $rules): string
    {
        if (empty($rules)) return "            // no validation rules defined";
        $lines = [];
        foreach ($rules as $field => $rule) {
            $ruleStr = is_array($rule) ? "['" . implode("', '", $rule) . "']" : "'{$rule}'";
            $lines[] = "            '{$field}' => {$ruleStr},";
        }
        return implode("\n", $lines);
    }

    private static function detectSearchFields(array $query): array
    {
        if (empty($query['search'])) return [];
        $raw = $query['search'];
        if (is_array($raw)) return $raw;
        return array_map('trim', explode(',', str_replace(['fields:', 'string|'], '', $raw)));
    }

    private static function extractDefault(string $rule): string
    {
        if (preg_match('/default:(\d+)/', $rule, $m)) return $m[1];
        return '15';
    }

    private static function generateFilterLogic(array $query): string
    {
        $lines = [];
        foreach ($query as $field => $rule) {
            if (in_array($field, ['per_page', 'search'])) continue;
            $lines[] = "        if (\$request->filled('{$field}')) {\n            \$query->where('{$field}', \$request->input('{$field}'));\n        }";
        }
        return implode("\n", $lines);
    }

    private static function extractValidationTables(array $module): array
    {
        $tables = [];
        foreach ($module['apis'] ?? [] as $api) {
            if (!empty($api['model'])) {
                $tables[] = ModelBuilder::prefixedTable($name, $api['model']);
            }
        }
        return $tables;
    }
}