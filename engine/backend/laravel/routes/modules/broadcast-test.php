<?php

// ── Auth routes — broadcast-test ──────────────────────────────────
use App\Http\Controllers\Arkzen\BroadcastTest\AuthController as BroadcastTestAuthController;

Route::middleware(['api'])->prefix('/api/broadcast-test/auth')->group(function () {
    Route::post('/register', [BroadcastTestAuthController::class, 'register']);
    Route::post('/login',    [BroadcastTestAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/broadcast-test/auth')->group(function () {
    Route::post('/logout', [BroadcastTestAuthController::class, 'logout']);
    Route::get('/me',      [BroadcastTestAuthController::class, 'me']);
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
        // Channel name: presence-broadcast-test-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-broadcast-test')) {
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
        // Channel name: private-broadcast-test.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-broadcast-test.';
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
// ── End auth — broadcast-test ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — broadcast-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:28:52.660819Z
// Resources: Message
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\BroadcastTest\MessageController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\BroadcastTest\PersonalAccessToken as BroadcastTestToken;

// v5.1: Scoped per-request — fires only when a route under /api/broadcast-test/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/broadcast-test/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(BroadcastTestToken::class);
    }
});

// ── Message ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/broadcast-test/messages')
    ->group(function () {

        // Get recent messages
        Route::get('/', [MessageController::class, 'index']);

        // Send a message and broadcast it on the selected channel type
        Route::post('/', [MessageController::class, 'store']);

        // Delete a message
        Route::delete('/{message}', [MessageController::class, 'destroy']);

    });
