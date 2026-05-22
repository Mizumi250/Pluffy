<?php

// ── Auth routes — certflow ──────────────────────────────────
use App\Http\Controllers\Arkzen\Certflow\AuthController as CertflowAuthController;

Route::middleware(['api'])->prefix('/api/certflow/auth')->group(function () {
    Route::post('/register', [CertflowAuthController::class, 'register']);
    Route::post('/login',    [CertflowAuthController::class, 'login']);
});

Route::middleware(['api', 'auth:sanctum'])->prefix('/api/certflow/auth')->group(function () {
    Route::post('/logout', [CertflowAuthController::class, 'logout']);
    Route::get('/me',      [CertflowAuthController::class, 'me']);
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
        // Channel name: presence-certflow-*
        // Reverb requires the HMAC to cover socketId:channelName:channelData
        // and the response must include channel_data for the member roster.
        if (str_starts_with($channelName, 'presence-certflow')) {
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
        // Channel name: private-certflow.{userId}
        // Verify user owns the channel, then sign socketId:channelName.
        $expectedPrefix = 'private-certflow.';
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
// ── End auth — certflow ─────────────────────────────────────


// ============================================================
// ARKZEN GENERATED ROUTES — certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-22T05:27:24.391013Z
// Resources: Template, Field, Submission, Scan
// Custom controllers: CertflowController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\Certflow\TemplateController;
use App\Http\Controllers\Arkzen\Certflow\FieldController;
use App\Http\Controllers\Arkzen\Certflow\SubmissionController;
use App\Http\Controllers\Arkzen\Certflow\ScanController;
use App\Http\Controllers\Arkzen\Certflow\CertflowController;

use Laravel\Sanctum\Sanctum;
use App\Models\Arkzen\Certflow\PersonalAccessToken as CertflowToken;

Sanctum::usePersonalAccessTokenModel(CertflowToken::class);

// ── Template ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/certflow')
    ->group(function () {

        // List all templates with their fields
        Route::get('/templates', [TemplateController::class, 'index']);

        // Create a new template
        Route::post('/templates', [TemplateController::class, 'store']);

        // Get a single template with fields
        Route::get('/templates/{template}', [TemplateController::class, 'show']);

        // Update template metadata or global font
        Route::put('/templates/{template}', [TemplateController::class, 'update']);

        // Delete a template and all its fields
        Route::delete('/templates/{template}', [TemplateController::class, 'destroy']);

    });

// ── Field ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/certflow')
    ->group(function () {

        // Add a new field to a template
        Route::post('/fields', [FieldController::class, 'store']);

        // Update field position, style, or label
        Route::put('/fields/{field}', [FieldController::class, 'update']);

        // Remove a field from a template
        Route::delete('/fields/{field}', [FieldController::class, 'destroy']);

    });

// ── Submission ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/certflow')
    ->group(function () {

        // List all submissions with template info
        Route::get('/submissions', [SubmissionController::class, 'index']);

        // Get a single submission by token for QR scan verification
        Route::get('/submissions/{token}', [SubmissionController::class, 'show']);

    });

// ── Scan ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/certflow')
    ->group(function () {

        // List all scans with submission info
        Route::get('/scans', [ScanController::class, 'index']);

    });

// ── Custom: CertflowController ─────────────────────────────
Route::middleware(['api'])
    ->group(function () {
        Route::post('api/certflow/templates/upload', [CertflowController::class, 'upload_template']);
        Route::post('api/certflow/templates/{id}/generate-link', [CertflowController::class, 'generate_link']);
        Route::get('api/certflow/fill/{token}', [CertflowController::class, 'get_fill_form']);
        Route::post('api/certflow/fill/{token}/submit', [CertflowController::class, 'submit_form']);
        Route::get('api/certflow/verify/{token}', [CertflowController::class, 'verify_submission']);
    });
