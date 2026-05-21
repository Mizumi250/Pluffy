<?php

// ── Auth routes — body-mail-notification ──────────────────────────────────
use App\Http\Controllers\Arkzen\BodyMailNotification\AuthController as BodyMailNotificationAuthController;

Route::middleware(['api'])->prefix('/api/body-mail-notification/auth')->group(function () {
    Route::post('/register', [BodyMailNotificationAuthController::class, 'register']);
    Route::post('/login',    [BodyMailNotificationAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/body-mail-notification/auth')->group(function () {
    Route::post('/logout', [BodyMailNotificationAuthController::class, 'logout']);
    Route::get('/me',      [BodyMailNotificationAuthController::class, 'me']);
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
        // Channel name: presence-body-mail-notification-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-body-mail-notification')) {
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
        // Channel name: private-body-mail-notification.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-body-mail-notification.';
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
// ── End auth — body-mail-notification ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — body-mail-notification
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-21T22:34:19.833621Z
// Resources: SendLog
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\BodyMailNotification\SendLogController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\BodyMailNotification\PersonalAccessToken as BodyMailNotificationToken;

Sanctum::usePersonalAccessTokenModel(BodyMailNotificationToken::class);

// ── SendLog ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/body-mail-notification')
    ->group(function () {

        // All send log entries for the authenticated user
        Route::get('/log', [SendLogController::class, 'index']);

        // Send a mail and write a log row — blade_body injection test
        Route::post('/send-mail', [SendLogController::class, 'sendMail']);

        // Trigger a notification and write a log row — toMail_body injection test
        Route::post('/notify', [SendLogController::class, 'notify']);

        // Wipe all send log entries for this user
        Route::delete('/log/clear', [SendLogController::class, 'clearLog']);

    });
