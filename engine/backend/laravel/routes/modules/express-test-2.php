<?php

// ── Auth routes — express-test-2 ──────────────────────────────────
use App\Http\Controllers\Arkzen\ExpressTest2\AuthController as ExpressTest2AuthController;
use App\Http\Controllers\Arkzen\ExpressTest2\SseController;

Route::middleware(['api'])->prefix('/api/express-test-2/auth')->group(function () {
    Route::post('/register', [ExpressTest2AuthController::class, 'register']);
    Route::post('/login',    [ExpressTest2AuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/express-test-2/auth')->group(function () {
    Route::post('/logout', [ExpressTest2AuthController::class, 'logout']);
    Route::get('/me',      [ExpressTest2AuthController::class, 'me']);
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
        // Channel name: presence-express-test-2-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-express-test-2')) {
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
        // Channel name: private-express-test-2.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-express-test-2.';
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
// ── End auth — express-test-2 ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.314765Z
// Resources: TestRecord, UploadedFile, CommandRun, JobResult, EventLog, SendLog
// Custom controllers: ExpressParityController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\ExpressTest2\RecordController;
use App\Http\Controllers\Arkzen\ExpressTest2\UploadedFileController;
use App\Http\Controllers\Arkzen\ExpressTest2\CommandController;
use App\Http\Controllers\Arkzen\ExpressTest2\DispatchController;
use App\Http\Controllers\Arkzen\ExpressTest2\EventController;
use App\Http\Controllers\Arkzen\ExpressTest2\MessagingController;
use App\Http\Controllers\Arkzen\ExpressTest2\ExpressParityController;
use App\Http\Middleware\Arkzen\ExpressTest2\JsonOnly;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\ExpressTest2\PersonalAccessToken as ExpressTest2Token;

// v5.1: Scoped per-request — fires only when a route under /api/express-test-2/ is matched.
// This prevents the global Sanctum::usePersonalAccessTokenModel() race condition
// where the last-loaded route file would override all other tatemonos' PAT models.
\Illuminate\Support\Facades\Route::matched(function (\Illuminate\Routing\Events\RouteMatched $event) {
    $uri = $event->request->path();
    if (str_starts_with($uri, 'api/express-test-2/')) {
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(ExpressTest2Token::class);
    }
});

// ── Scoped middleware aliases for this tatemono ────────────
app('router')->aliasMiddleware('jsonOnly', \App\Http\Middleware\Arkzen\ExpressTest2\JsonOnly::class);

// ── TestRecord ─────────────────────────────
Route::middleware(['api', 'auth:sanctum', 'jsonOnly'])
    ->prefix('/api/express-test-2')
    ->group(function () {

        // List records with filtering and pagination
        Route::get('/records', [RecordController::class, 'index']);

        // Create a record
        Route::post('/records', [RecordController::class, 'store']);

        // Show a record
        Route::get('/records/{testRecord}', [RecordController::class, 'show']);

        // Update a record
        Route::put('/records/{testRecord}', [RecordController::class, 'update']);

        // Delete a record
        Route::delete('/records/{testRecord}', [RecordController::class, 'destroy']);

        // Aggregate records
        Route::get('/records/stats', [RecordController::class, 'stats']);

    });

// ── UploadedFile ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/express-test-2')
    ->group(function () {

        // List uploaded files
        Route::get('/files', [UploadedFileController::class, 'index']);

        // Upload files
        Route::post('/files', [UploadedFileController::class, 'store']);

        // Delete an uploaded file
        Route::delete('/files/{uploadedFile}', [UploadedFileController::class, 'destroy']);

        // Download an uploaded file
        Route::get('/files/{uploadedFile}/url', [UploadedFileController::class, 'fileUrl']);

    });

// ── CommandRun ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/express-test-2')
    ->group(function () {

        // List command runs
        Route::get('/commands', [CommandController::class, 'index']);

        // Run a command
        Route::post('/commands/run', [CommandController::class, 'store']);

    });

// ── JobResult ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/express-test-2')
    ->group(function () {

        // Dispatch a queued job
        Route::post('/jobs/dispatch', [DispatchController::class, 'store']);

    });

// ── EventLog ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/express-test-2')
    ->group(function () {

        // Fire an event
        Route::post('/events/fire', [EventController::class, 'store']);

    });

// ── SendLog ─────────────────────────────
Route::middleware(['api', 'auth:sanctum'])
    ->prefix('/api/express-test-2')
    ->group(function () {

        // Store and broadcast a message
        Route::post('/broadcast', [MessagingController::class, 'broadcast']);

        // Send a mail
        Route::post('/mail', [MessagingController::class, 'sendMail']);

        // Trigger a notification
        Route::post('/notify', [MessagingController::class, 'notify']);

    });

// ── Custom: ExpressParityController ─────────────────────────────
Route::middleware(['auth:sanctum'])
    ->group(function () {
        Route::get('api/express-test-2/health/{name}', [ExpressParityController::class, 'health']);
        Route::post('api/express-test-2/echo', [ExpressParityController::class, 'echo']);
    });

// ── SSE bridge (Lynx only — auto-generated alongside broadcasting) ──
// 'sse-poll' is the safe default: a one-shot JSON poll using plain
// fetch, since streaming fetch-body support in Lynx's runtime is
// unconfirmed. 'sse' (streaming) is kept for web/future Lynx use.
Route::middleware(['api'])
    ->prefix('/api/express-test-2/sse')
    ->group(function () {
        Route::get('/{channelType}', [SseController::class, 'stream']);
    });

Route::middleware(['api'])
    ->prefix('/api/express-test-2/sse-poll')
    ->group(function () {
        Route::get('/{channelType}', [SseController::class, 'poll']);
    });
