<?php

// ── Auth routes — notification-test ──────────────────────────────────
use App\Http\Controllers\Arkzen\NotificationTest\AuthController as NotificationTestAuthController;

Route::middleware(['api'])->prefix('/api/notification-test/auth')->group(function () {
    Route::post('/register', [NotificationTestAuthController::class, 'register']);
    Route::post('/login',    [NotificationTestAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/notification-test/auth')->group(function () {
    Route::post('/logout', [NotificationTestAuthController::class, 'logout']);
    Route::get('/me',      [NotificationTestAuthController::class, 'me']);
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
        // Channel name: presence-notification-test-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-notification-test')) {
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
        // Channel name: private-notification-test.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-notification-test.';
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
// ── End auth — notification-test ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — notification-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T03:10:03.733661Z
// Resources: Notification
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\NotificationTest\NotificationController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\NotificationTest\PersonalAccessToken as NotificationTestToken;

Sanctum::usePersonalAccessTokenModel(NotificationTestToken::class);

// ── Notification ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/notification-test')
    ->group(function () {

        // Get all notifications for the authenticated user
        Route::get('/inbox', [NotificationController::class, 'index']);

        // Trigger a notification
        Route::post('/trigger', [NotificationController::class, 'store']);

        // Delete a notification
        Route::delete('/inbox/{notification}', [NotificationController::class, 'destroy']);

        // Mark all notifications as read
        Route::post('/inbox/read-all', [NotificationController::class, 'readAll']);

    });
