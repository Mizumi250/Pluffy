<?php

// ── Auth routes — shikaku ──────────────────────────────────
use App\Http\Controllers\Arkzen\Shikaku\AuthController as ShikakuAuthController;

Route::middleware(['api'])->prefix('/api/shikaku/auth')->group(function () {
    Route::post('/register', [ShikakuAuthController::class, 'register']);
    Route::post('/login',    [ShikakuAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/shikaku/auth')->group(function () {
    Route::post('/logout', [ShikakuAuthController::class, 'logout']);
    Route::get('/me',      [ShikakuAuthController::class, 'me']);
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $socketId    = $request->input('socket_id');
        $channelName = $request->input('channel_name');

        if (!$socketId || !$channelName) {
            return response()->json(['message' => 'Missing socket_id or channel_name.'], 422);
        }

        $secret = config('reverb.apps.apps.0.secret', env('REVERB_APP_SECRET'));
        $appKey = config('reverb.apps.apps.0.key',    env('REVERB_APP_KEY'));

        // ── Presence channel ──────────────────────────────────────────
        // Channel name: presence-shikaku-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-shikaku')) {
            $channelData = json_encode([
                'user_id'   => $user->id,
                'user_info' => ['name' => $user->name ?? $user->email],
            ]);
            $signature = hash_hmac('sha256', "$socketId:$channelName:$channelData", $secret);
            return response()->json([
                'auth'         => "$appKey:$signature",
                'channel_data' => $channelData,
            ]);
        }

        // ── Private channel ───────────────────────────────────────────
        // Channel name: private-shikaku.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-shikaku.';
        if (!str_starts_with($channelName, $expectedPrefix)) {
            return response()->json(['message' => 'Invalid channel prefix.'], 403);
        }

        $channelUserId = (int) substr($channelName, strlen($expectedPrefix));
        if ($channelUserId !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $signature = hash_hmac('sha256', "$socketId:$channelName", $secret);
        return response()->json(['auth' => "$appKey:$signature"]);
    });
});
// ── End auth — shikaku ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:54.066594Z
// Resources: ShikakuProject, ShikakuSave
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\Shikaku\ShikakuProjectController;
use App\Http\Controllers\Arkzen\Shikaku\ShikakuSaveController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\Shikaku\PersonalAccessToken as ShikakuToken;

// v5.1: Scoped per-request — fires only when a route under /api/shikaku/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/shikaku/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(ShikakuToken::class);
    }
});

// ── ShikakuProject ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/shikaku/projects')
    ->group(function () {

        // List all projects for current user
        Route::get('/', [ShikakuProjectController::class, 'index']);

        // Create a new pixel art project
        Route::post('/', [ShikakuProjectController::class, 'store']);

        // Load a project with its latest save
        Route::get('/{shikakuProject}', [ShikakuProjectController::class, 'show']);

        // Update project name or thumbnail
        Route::put('/{shikakuProject}', [ShikakuProjectController::class, 'update']);

        // Delete project and all its saves
        Route::delete('/{shikakuProject}', [ShikakuProjectController::class, 'destroy']);

    });

// ── ShikakuSave ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/shikaku/projects')
    ->group(function () {

        // Save current frame/layer state as JSON blob
        Route::post('/{project_id}/save', [ShikakuSaveController::class, 'save']);

        // Load most recent save for a project
        Route::get('/{project_id}/latest', [ShikakuSaveController::class, 'latest']);

    });
