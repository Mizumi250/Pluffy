<?php

// ── Auth routes — express-test ──────────────────────────────────
use App\Http\Controllers\Arkzen\ExpressTest\AuthController as ExpressTestAuthController;

Route::middleware(['api'])->prefix('/api/express-test/auth')->group(function () {
    Route::post('/register', [ExpressTestAuthController::class, 'register']);
    Route::post('/login',    [ExpressTestAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/express-test/auth')->group(function () {
    Route::post('/logout', [ExpressTestAuthController::class, 'logout']);
    Route::get('/me',      [ExpressTestAuthController::class, 'me']);
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
        // Channel name: presence-express-test-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-express-test')) {
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
        // Channel name: private-express-test.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-express-test.';
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
// ── End auth — express-test ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — express-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:43.216172Z
// Resources: Ticket, JobResult
// Custom controllers: ProbeController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\ExpressTest\TicketController;
use App\Http\Controllers\Arkzen\ExpressTest\PingController;
use App\Http\Controllers\Arkzen\ExpressTest\ProbeController;
use App\Http\Middleware\Arkzen\ExpressTest\RequireJson;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\ExpressTest\PersonalAccessToken as ExpressTestToken;

// v5.1: Scoped per-request — fires only when a route under /api/express-test/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/express-test/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(ExpressTestToken::class);
    }
});

// ── Scoped middleware aliases for this tatemono ────────────
app('router')->aliasMiddleware('requireJson', \App\Http\Middleware\Arkzen\ExpressTest\RequireJson::class);

// ── Ticket ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/express-test')
    ->group(function () {

        // List tickets
        Route::get('/tickets', [TicketController::class, 'index']);

        // Create ticket
        Route::post('/tickets', [TicketController::class, 'store']);

        // Show ticket
        Route::get('/tickets/{ticket}', [TicketController::class, 'show']);

        // Update ticket
        Route::put('/tickets/{ticket}', [TicketController::class, 'update']);

        // Delete ticket
        Route::delete('/tickets/{ticket}', [TicketController::class, 'destroy']);

        // Custom endpoint with a :ts body
        Route::get('/stats', [TicketController::class, 'stats']);

    });

// ── JobResult ─────────────────────────────
Route::middleware(['api', 'requireJson'])
    ->prefix('/api/express-test')
    ->group(function () {

        // Public, passes requireJson
        Route::get('/ping', [PingController::class, 'index']);

    });

// ── Custom: ProbeController ─────────────────────────────
Route::middleware(['api'])
    ->group(function () {
        Route::get('api/express-test/probe/{name}', [ProbeController::class, 'probe']);
    });
