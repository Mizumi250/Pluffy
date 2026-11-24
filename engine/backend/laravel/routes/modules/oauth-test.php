<?php

// ── Auth routes — oauth-test ──────────────────────────────────
use App\Http\Controllers\Arkzen\OauthTest\AuthController as OauthTestAuthController;

use App\Http\Controllers\Arkzen\OauthTest\OAuthController as OauthTestOAuthController;

Route::middleware(['api'])->prefix('/api/oauth-test/auth/oauth')->group(function () {
    Route::get('/providers', [OauthTestOAuthController::class, 'providers']);
    Route::get('/{provider}/redirect', [OauthTestOAuthController::class, 'redirect']);
    Route::match(['GET', 'POST'], '/{provider}/callback', [OauthTestOAuthController::class, 'callback']);
});

Route::middleware(['api'])->prefix('/api/oauth-test/auth')->group(function () {
    Route::post('/register', [OauthTestAuthController::class, 'register']);
    Route::post('/login',    [OauthTestAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/oauth-test/auth')->group(function () {
    Route::post('/logout', [OauthTestAuthController::class, 'logout']);
    Route::get('/me',      [OauthTestAuthController::class, 'me']);
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
        // Channel name: presence-oauth-test-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-oauth-test')) {
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
        // Channel name: private-oauth-test.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-oauth-test.';
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
// ── End auth — oauth-test ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — oauth-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:07.646718Z
// Resources: 
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;


use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\OauthTest\PersonalAccessToken as OauthTestToken;

// v5.1: Scoped per-request — fires only when a route under /api/oauth-test/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/oauth-test/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(OauthTestToken::class);
    }
});


