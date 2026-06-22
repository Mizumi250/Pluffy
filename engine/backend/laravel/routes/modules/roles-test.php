<?php

// ── Auth routes — roles-test ──────────────────────────────────
use App\Http\Controllers\Arkzen\RolesTest\AuthController as RolesTestAuthController;

Route::middleware(['api'])->prefix('/api/roles-test/auth')->group(function () {
    Route::post('/register', [RolesTestAuthController::class, 'register']);
    Route::post('/login',    [RolesTestAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/roles-test/auth')->group(function () {
    Route::post('/logout', [RolesTestAuthController::class, 'logout']);
    Route::get('/me',      [RolesTestAuthController::class, 'me']);
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
        // Channel name: presence-roles-test-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-roles-test')) {
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
        // Channel name: private-roles-test.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-roles-test.';
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
// ── End auth — roles-test ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — roles-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:33.301889Z
// Resources: RoleAuditLog
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\RolesTest\RoleAuditLogController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\RolesTest\PersonalAccessToken as RolesTestToken;

// v5.1: Scoped per-request — fires only when a route under /api/roles-test/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/roles-test/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(RolesTestToken::class);
    }
});

// ── RoleAuditLog ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/roles-test')
    ->group(function () {

        // Audit log of all access attempts
        Route::get('/logs', [RoleAuditLogController::class, 'index']);

        // Admin-only route — role check performed in controller body ($user->role === 'admin')
        Route::get('/admin-only', [RoleAuditLogController::class, 'adminOnly']);

        // Any authenticated user — no role gate
        Route::get('/user-only', [RoleAuditLogController::class, 'userOnly']);

        // Promote the authenticated user to admin role
        Route::post('/promote', [RoleAuditLogController::class, 'promote']);

        // Demote the authenticated user back to user role
        Route::post('/demote', [RoleAuditLogController::class, 'demote']);

    });
