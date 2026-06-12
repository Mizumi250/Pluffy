<?php

// ── Auth routes — mail-test ──────────────────────────────────
use App\Http\Controllers\Arkzen\MailTest\AuthController as MailTestAuthController;

Route::middleware(['api'])->prefix('/api/mail-test/auth')->group(function () {
    Route::post('/register', [MailTestAuthController::class, 'register']);
    Route::post('/login',    [MailTestAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/mail-test/auth')->group(function () {
    Route::post('/logout', [MailTestAuthController::class, 'logout']);
    Route::get('/me',      [MailTestAuthController::class, 'me']);
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
        // Channel name: presence-mail-test-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-mail-test')) {
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
        // Channel name: private-mail-test.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-mail-test.';
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
// ── End auth — mail-test ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — mail-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T09:10:07.740406Z
// Resources: MailLog
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\MailTest\MailLogController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\MailTest\PersonalAccessToken as MailTestToken;

// v5.1: Scoped per-request — fires only when a route under /api/mail-test/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/mail-test/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(MailTestToken::class);
    }
});

// ── MailLog ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/mail-test')
    ->group(function () {

        // Get all mail logs
        Route::get('/logs', [MailLogController::class, 'index']);

        // Send an email
        Route::post('/send', [MailLogController::class, 'store']);

    });
