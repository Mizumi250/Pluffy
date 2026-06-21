<?php

// ============================================================
// ARKZEN ENGINE — SSE BRIDGE BUILDER v1.0
//
// Generates a Lynx-only SSE controller for any tatemono that has
// @arkzen:realtime blocks, mirroring what BroadcastBuilder already
// emits for Reverb. Lynx has no WebSocket support (see
// lynxjs.org/guide/interaction/networking) — EventSource/SSE is
// its supported path for live server updates — so this rides
// alongside the existing Reverb broadcast wiring instead of
// replacing it. Web/Expo keep using the real WebSocket/Reverb path
// untouched.
//
// Called from ArkzenEngineController Phase 9, right after
// BroadcastBuilder::build() and ChannelBuilder::build(), so it has
// the same $module shape and runs only when realtimes are present.
//
// Output per tatemono:
//   app/Http/Controllers/Arkzen/{SlugNs}/SseController.php
//   + GET /api/{slug}/sse/{channelType} appended to
//     routes/modules/{slug}.php (the file RouteRegistrar already
//     wrote in Phase 6).
//
// The model polled is taken from the api whose endpoint declares
// `type: broadcast` (e.g. the `store` endpoint in @arkzen:api).
// If no such endpoint exists, the builder skips — there is nothing
// for it to poll.
// ============================================================

namespace App\Arkzen\Builders;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class SseBridgeBuilder
{
    public static function build(array $module): void
    {
        $realtimeEvents = $module['realtimes']['events'] ?? [];
        if (empty($realtimeEvents)) return;

        $slug   = $module['name'];
        $slugNs = EventBuilder::toNamespace($slug);

        $broadcastApi = self::findBroadcastApi($module['apis'] ?? []);
        if (!$broadcastApi) {
            Log::info("[Arkzen SSE] Skipped — no broadcast-type endpoint found for: {$slug}");
            return;
        }

        $model       = $broadcastApi['model'];
        $eventMap    = self::buildEventNameMap($slug, $realtimeEvents);
        $controllerDir = app_path("Http/Controllers/Arkzen/{$slugNs}");
        File::ensureDirectoryExists($controllerDir);

        self::buildSseController($slug, $slugNs, $model, $eventMap);
        self::appendSseRoute($slug, $slugNs);
    }

    private static function findBroadcastApi(array $apis): ?array
    {
        foreach ($apis as $api) {
            foreach (($api['endpoints'] ?? []) as $endpoint) {
                if (($endpoint['type'] ?? null) === 'broadcast') {
                    return $api;
                }
            }
        }
        return null;
    }

    /**
     * Maps channel type (public/private/presence) → broadcastAs() name,
     * matching the same '{slug}.{eventName}' convention BroadcastBuilder
     * uses, so the Lynx client parses identical event names regardless
     * of whether it arrived over Reverb (web/Expo) or SSE (Lynx).
     */
    private static function buildEventNameMap(string $slug, array $realtimeEvents): array
    {
        $map = [];
        foreach ($realtimeEvents as $name => $config) {
            $type = is_array($config) ? ($config['type'] ?? 'public') : 'public';
            if (!isset($map[$type])) {
                $map[$type] = "{$slug}.{$name}";
            }
        }
        return $map;
    }

    private static function buildSseController(string $slug, string $slugNs, string $model, array $eventMap): void
    {
        $filePath  = app_path("Http/Controllers/Arkzen/{$slugNs}/SseController.php");
        $generated = now()->toISOString();

        $eventMapLines = [];
        foreach ($eventMap as $type => $eventName) {
            $eventMapLines[] = "        '{$type}' => '{$eventName}',";
        }
        $eventMapBlock = implode("\n", $eventMapLines);

        $content = "<?php\n"
            . "\n"
            . "// ============================================================\n"
            . "// ARKZEN GENERATED — Lynx SSE bridge for {$slug}\n"
            . "// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.\n"
            . "// Generated: {$generated}\n"
            . "// ============================================================\n"
            . "\n"
            . "namespace App\\Http\\Controllers\\Arkzen\\{$slugNs};\n"
            . "\n"
            . "use App\\Http\\Controllers\\Arkzen\\Support\\LynxSseBridgeController;\n"
            . "use App\\Models\\Arkzen\\{$slugNs}\\{$model};\n"
            . "\n"
            . "class SseController extends LynxSseBridgeController\n"
            . "{\n"
            . "    protected string \$model = {$model}::class;\n"
            . "\n"
            . "    protected array \$eventNameMap = [\n"
            . "{$eventMapBlock}\n"
            . "    ];\n"
            . "}\n";

        File::put($filePath, $content);
        Log::info("[Arkzen SSE] ✓ {$slugNs}\\SseController generated for: {$slug}");
    }

    /**
     * Appends the SSE route to the route file RouteRegistrar already
     * wrote in Phase 6 — same append-after-initial-write pattern
     * ChannelBuilder uses for routes/channels.php.
     */
    private static function appendSseRoute(string $slug, string $slugNs): void
    {
        $routeFile = base_path("routes/modules/{$slug}.php");

        if (!File::exists($routeFile)) {
            Log::warning("[Arkzen SSE] Route file missing, cannot append SSE route: {$slug}");
            return;
        }

        $content = File::get($routeFile);

        if (str_contains($content, "/sse-poll/{channelType}")) {
            Log::info("[Arkzen SSE] Route already registered for: {$slug}");
            return;
        }

        // Inject the use-statement near the top, right after the last
        // existing `use App\Http\Controllers\Arkzen\...` line, then
        // append the route group at the end of the file.
        $useStatement = "use App\\Http\\Controllers\\Arkzen\\{$slugNs}\\SseController;";

        if (!str_contains($content, $useStatement)) {
            $content = preg_replace(
                '/^(use App\\\\Http\\\\Controllers\\\\Arkzen\\\\.+;\n)(?!use App\\\\Http\\\\Controllers\\\\Arkzen)/m',
                "$1{$useStatement}\n",
                $content,
                1
            );
        }

        $routeBlock = "\n"
            . "// ── SSE bridge (Lynx only — auto-generated alongside broadcasting) ──\n"
            . "// 'sse-poll' is the safe default: a one-shot JSON poll using plain\n"
            . "// fetch, since streaming fetch-body support in Lynx's runtime is\n"
            . "// unconfirmed. 'sse' (streaming) is kept for web/future Lynx use.\n"
            . "Route::middleware(['api'])\n"
            . "    ->prefix('/api/{$slug}/sse')\n"
            . "    ->group(function () {\n"
            . "        Route::get('/{channelType}', [SseController::class, 'stream']);\n"
            . "    });\n"
            . "\n"
            . "Route::middleware(['api'])\n"
            . "    ->prefix('/api/{$slug}/sse-poll')\n"
            . "    ->group(function () {\n"
            . "        Route::get('/{channelType}', [SseController::class, 'poll']);\n"
            . "    });\n";

        File::put($routeFile, $content . $routeBlock);
        Log::info("[Arkzen SSE] ✓ Route appended: /api/{$slug}/sse/{channelType}");
    }

    public static function remove(string $moduleName, string $slugNs): void
    {
        $filePath = app_path("Http/Controllers/Arkzen/{$slugNs}/SseController.php");
        if (File::exists($filePath)) {
            File::delete($filePath);
            Log::info("[Arkzen SSE] ✓ SseController removed for: {$moduleName}");
        }
    }
}
