<?php

// ── Auth routes — kotoba ──────────────────────────────────
use App\Http\Controllers\Arkzen\Kotoba\AuthController as KotobaAuthController;

Route::middleware(['api'])->prefix('/api/kotoba/auth')->group(function () {
    Route::post('/register', [KotobaAuthController::class, 'register']);
    Route::post('/login',    [KotobaAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/kotoba/auth')->group(function () {
    Route::post('/logout', [KotobaAuthController::class, 'logout']);
    Route::get('/me',      [KotobaAuthController::class, 'me']);
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
        // Channel name: presence-kotoba-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-kotoba')) {
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
        // Channel name: private-kotoba.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-kotoba.';
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
// ── End auth — kotoba ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:59.606298Z
// Resources: Profile, Post, Comment, Like, Follow, Mission, Lesson, LessonResult, VocabCard, Conversation, Message, Circle, CircleMember, Alert
// Custom controllers: KotobaController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\Kotoba\ProfileController;
use App\Http\Controllers\Arkzen\Kotoba\PostController;
use App\Http\Controllers\Arkzen\Kotoba\CommentController;
use App\Http\Controllers\Arkzen\Kotoba\LikeController;
use App\Http\Controllers\Arkzen\Kotoba\FollowController;
use App\Http\Controllers\Arkzen\Kotoba\MissionController;
use App\Http\Controllers\Arkzen\Kotoba\LessonController;
use App\Http\Controllers\Arkzen\Kotoba\LessonResultController;
use App\Http\Controllers\Arkzen\Kotoba\VocabCardController;
use App\Http\Controllers\Arkzen\Kotoba\ConversationController;
use App\Http\Controllers\Arkzen\Kotoba\MessageController;
use App\Http\Controllers\Arkzen\Kotoba\CircleController;
use App\Http\Controllers\Arkzen\Kotoba\CircleMemberController;
use App\Http\Controllers\Arkzen\Kotoba\AlertController;
use App\Http\Controllers\Arkzen\Kotoba\KotobaController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\Kotoba\PersonalAccessToken as KotobaToken;

// v5.1: Scoped per-request — fires only when a route under /api/kotoba/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/kotoba/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(KotobaToken::class);
    }
});

// ── Profile ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/profiles')
    ->group(function () {

        // Reserved
        Route::get('/status', [ProfileController::class, 'status']);

    });

// ── Post ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/posts')
    ->group(function () {

        // Reserved
        Route::get('/status', [PostController::class, 'status']);

    });

// ── Comment ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/comments')
    ->group(function () {

        // Reserved
        Route::get('/status', [CommentController::class, 'status']);

    });

// ── Like ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/likes')
    ->group(function () {

        // Reserved
        Route::get('/status', [LikeController::class, 'status']);

    });

// ── Follow ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/follows')
    ->group(function () {

        // Reserved
        Route::get('/status', [FollowController::class, 'status']);

    });

// ── Mission ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/missions')
    ->group(function () {

        // Reserved
        Route::get('/status', [MissionController::class, 'status']);

    });

// ── Lesson ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/lessons')
    ->group(function () {

        // Reserved
        Route::get('/status', [LessonController::class, 'status']);

    });

// ── LessonResult ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/lesson-results')
    ->group(function () {

        // Reserved
        Route::get('/status', [LessonResultController::class, 'status']);

    });

// ── VocabCard ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/vocab-cards')
    ->group(function () {

        // Reserved
        Route::get('/status', [VocabCardController::class, 'status']);

    });

// ── Conversation ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/conversations')
    ->group(function () {

        // Reserved
        Route::get('/status', [ConversationController::class, 'status']);

    });

// ── Message ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/messages')
    ->group(function () {

        // Reserved
        Route::get('/status', [MessageController::class, 'status']);

    });

// ── Circle ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/circles')
    ->group(function () {

        // Reserved
        Route::get('/status', [CircleController::class, 'status']);

    });

// ── CircleMember ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/circle-members')
    ->group(function () {

        // Reserved
        Route::get('/status', [CircleMemberController::class, 'status']);

    });

// ── Alert ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/kotoba/x/alerts')
    ->group(function () {

        // Reserved
        Route::get('/status', [AlertController::class, 'status']);

    });

// ── Custom: KotobaController ─────────────────────────────
Route::middleware(['auth:sanctum'])
    ->group(function () {
        Route::get('api/kotoba/me', [KotobaController::class, 'me']);
        Route::put('api/kotoba/me', [KotobaController::class, 'update_me']);
        Route::get('api/kotoba/home', [KotobaController::class, 'home']);
        Route::post('api/kotoba/activity', [KotobaController::class, 'bump']);
        Route::post('api/kotoba/internal/notify', [KotobaController::class, 'notify']);
        Route::post('api/kotoba/internal/seed', [KotobaController::class, 'community_seed']);
        Route::get('api/kotoba/feed', [KotobaController::class, 'feed']);
        Route::post('api/kotoba/posts', [KotobaController::class, 'create_post']);
        Route::delete('api/kotoba/posts/{id}', [KotobaController::class, 'delete_post']);
        Route::post('api/kotoba/posts/{id}/like', [KotobaController::class, 'toggle_like']);
        Route::get('api/kotoba/posts/{id}/comments', [KotobaController::class, 'list_comments']);
        Route::post('api/kotoba/posts/{id}/comments', [KotobaController::class, 'add_comment']);
        Route::post('api/kotoba/comments/{id}/accept', [KotobaController::class, 'accept_correction']);
        Route::get('api/kotoba/lessons', [KotobaController::class, 'list_lessons']);
        Route::post('api/kotoba/lessons/{id}/complete', [KotobaController::class, 'complete_lesson']);
        Route::get('api/kotoba/vocab', [KotobaController::class, 'list_cards']);
        Route::post('api/kotoba/vocab', [KotobaController::class, 'add_card']);
        Route::post('api/kotoba/vocab/{id}/review', [KotobaController::class, 'review_card']);
        Route::delete('api/kotoba/vocab/{id}', [KotobaController::class, 'delete_card']);
        Route::get('api/kotoba/partners', [KotobaController::class, 'partners']);
        Route::get('api/kotoba/profile/{id}', [KotobaController::class, 'view_profile']);
        Route::post('api/kotoba/follow/{id}', [KotobaController::class, 'toggle_follow']);
        Route::get('api/kotoba/conversations', [KotobaController::class, 'list_conversations']);
        Route::post('api/kotoba/conversations', [KotobaController::class, 'start_conversation']);
        Route::get('api/kotoba/messages', [KotobaController::class, 'list_messages']);
        Route::post('api/kotoba/messages', [KotobaController::class, 'send_message']);
        Route::post('api/kotoba/messages/{id}/correct', [KotobaController::class, 'correct_message']);
        Route::get('api/kotoba/circles', [KotobaController::class, 'list_circles']);
        Route::post('api/kotoba/circles', [KotobaController::class, 'create_circle']);
        Route::post('api/kotoba/circles/{id}/join', [KotobaController::class, 'toggle_join']);
        Route::get('api/kotoba/alerts', [KotobaController::class, 'list_alerts']);
        Route::post('api/kotoba/alerts/read', [KotobaController::class, 'read_alerts']);
        Route::get('api/kotoba/progress', [KotobaController::class, 'progress']);
    });
