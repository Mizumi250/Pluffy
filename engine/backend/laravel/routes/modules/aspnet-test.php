<?php

// ── Auth routes — aspnet-test ──────────────────────────────────
use App\Http\Controllers\Arkzen\AspnetTest\AuthController as AspnetTestAuthController;

Route::middleware(['api'])->prefix('/api/aspnet-test/auth')->group(function () {
    Route::post('/register', [AspnetTestAuthController::class, 'register']);
    Route::post('/login',    [AspnetTestAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/aspnet-test/auth')->group(function () {
    Route::post('/logout', [AspnetTestAuthController::class, 'logout']);
    Route::get('/me',      [AspnetTestAuthController::class, 'me']);
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
        // Channel name: presence-aspnet-test-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-aspnet-test')) {
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
        // Channel name: private-aspnet-test.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-aspnet-test.';
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
// ── End auth — aspnet-test ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:33.578275Z
// Resources: Check, AuditLog, AuditLog, AuditLog
// Custom controllers: ProbeController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\AspnetTest\CheckController;
use App\Http\Controllers\Arkzen\AspnetTest\PublicController;
use App\Http\Controllers\Arkzen\AspnetTest\PingController;
use App\Http\Controllers\Arkzen\AspnetTest\AdminController;
use App\Http\Controllers\Arkzen\AspnetTest\ProbeController;
use App\Http\Middleware\Arkzen\AspnetTest\RequireJson;
use App\Http\Middleware\Arkzen\AspnetTest\CheckRole;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\AspnetTest\PersonalAccessToken as AspnetTestToken;

// v5.1: Scoped per-request — fires only when a route under /api/aspnet-test/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/aspnet-test/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(AspnetTestToken::class);
    }
});

// ── Scoped middleware aliases for this tatemono ────────────
app('router')->aliasMiddleware('requireJson', \App\Http\Middleware\Arkzen\AspnetTest\RequireJson::class);
app('router')->aliasMiddleware('role', \App\Http\Middleware\Arkzen\AspnetTest\CheckRole::class);

// ── Check ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/aspnet-test')
    ->group(function () {

        // List checks with search, status filter and pagination
        Route::get('/checks', [CheckController::class, 'index']);

        // Create a check
        Route::post('/checks', [CheckController::class, 'store']);

        // Show a check
        Route::get('/checks/{check}', [CheckController::class, 'show']);

        // Update a check (owner or admin, enforced by the C# policy)
        Route::put('/checks/{check}', [CheckController::class, 'update']);

        // Delete a check (admin only, enforced by the C# policy)
        Route::delete('/checks/{check}', [CheckController::class, 'destroy']);

        // Mark a check passed and write an audit row in one transaction
        Route::post('/checks/{check}/pass', [CheckController::class, 'pass']);

        // Custom C# endpoint that aggregates checks by status
        Route::get('/stats', [CheckController::class, 'stats']);

    });

// ── AuditLog ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/aspnet-test')
    ->group(function () {

        // Public health endpoint with a live row count
        Route::get('/health', [PublicController::class, 'health']);

    });

// ── AuditLog ─────────────────────────────
Route::middleware(['api', 'requireJson'])
    ->prefix('/api/aspnet-test')
    ->group(function () {

        // Public, but guarded by the requireJson C# middleware
        Route::get('/ping', [PingController::class, 'ping']);

    });

// ── AuditLog ─────────────────────────────
Route::middleware(['api', 'auth:sanctum', 'role:admin'])
    ->prefix('/api/aspnet-test')
    ->group(function () {

        // Latest audit rows, admin role only
        Route::get('/admin/audit', [AdminController::class, 'audit']);

    });

// ── Custom: ProbeController ─────────────────────────────
Route::middleware(['api'])
    ->group(function () {
        Route::get('api/aspnet-test/probe/{name}', [ProbeController::class, 'probe']);
    });
