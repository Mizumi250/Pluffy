<?php

// ── Auth routes — church-community ──────────────────────────────────
use App\Http\Controllers\Arkzen\ChurchCommunity\AuthController as ChurchCommunityAuthController;

Route::middleware(['api'])->prefix('/api/church-community/auth')->group(function () {
    Route::post('/register', [ChurchCommunityAuthController::class, 'register']);
    Route::post('/login',    [ChurchCommunityAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/church-community/auth')->group(function () {
    Route::post('/logout', [ChurchCommunityAuthController::class, 'logout']);
    Route::get('/me',      [ChurchCommunityAuthController::class, 'me']);
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
        // Channel name: presence-church-community-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-church-community')) {
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
        // Channel name: private-church-community.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-church-community.';
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
// ── End auth — church-community ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T14:42:20.541641Z
// Resources: Event, Member, Photo
// Custom controllers: ChurchController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\ChurchCommunity\EventController;
use App\Http\Controllers\Arkzen\ChurchCommunity\MemberController;
use App\Http\Controllers\Arkzen\ChurchCommunity\PhotoController;
use App\Http\Controllers\Arkzen\ChurchCommunity\ChurchController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\ChurchCommunity\PersonalAccessToken as ChurchCommunityToken;

Sanctum::usePersonalAccessTokenModel(ChurchCommunityToken::class);

// ── Event ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/church-community')
    ->group(function () {

        // Get all events ordered by event_date desc
        Route::get('/events', [EventController::class, 'index']);

        // Create a new church event
        Route::post('/events', [EventController::class, 'store']);

        // Get a single event with its photos
        Route::get('/events/{event}', [EventController::class, 'show']);

        // Update an existing church event
        Route::put('/events/{event}', [EventController::class, 'update']);

        // Delete a church event
        Route::delete('/events/{event}', [EventController::class, 'destroy']);

    });

// ── Member ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/church-community')
    ->group(function () {

        // Get all church members
        Route::get('/members', [MemberController::class, 'index']);

        // Add a new church member
        Route::post('/members', [MemberController::class, 'store']);

        // Get a single church member
        Route::get('/members/{member}', [MemberController::class, 'show']);

        // Update a church member
        Route::put('/members/{member}', [MemberController::class, 'update']);

        // Remove a church member
        Route::delete('/members/{member}', [MemberController::class, 'destroy']);

    });

// ── Photo ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/church-community')
    ->group(function () {

        // Get all photos
        Route::get('/photos', [PhotoController::class, 'index']);

        // Upload a new photo
        Route::post('/photos', [PhotoController::class, 'store']);

        // Get a single photo
        Route::get('/photos/{photo}', [PhotoController::class, 'show']);

        // Update a photo caption or tags
        Route::put('/photos/{photo}', [PhotoController::class, 'update']);

        // Delete a photo
        Route::delete('/photos/{photo}', [PhotoController::class, 'destroy']);

    });

// ── Custom: ChurchController ─────────────────────────────
Route::middleware(['api'])
    ->group(function () {
        Route::get('api/church-community/events/{event_id}/photos', [ChurchController::class, 'event_photos']);
        Route::post('api/church-community/photos/{photo_id}/like', [ChurchController::class, 'toggle_like']);
        Route::get('api/church-community/photos/{photo_id}/comments', [ChurchController::class, 'photo_comments']);
        Route::post('api/church-community/photos/{photo_id}/comments', [ChurchController::class, 'add_comment']);
        Route::get('api/church-community/inventory', [ChurchController::class, 'inventory_list']);
    });
