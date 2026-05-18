<?php

// ============================================================
// ARKZEN GENERATED ROUTES — middleware-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T12:04:25.216456Z
// Resources: PingLog
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\MiddlewareTest\PingLogController;
use App\Http\Middleware\Arkzen\MiddlewareTest\RequireJson;

// ── Scoped middleware aliases for this tatemono ────────────
app('router')->aliasMiddleware('requireJson', \App\Http\Middleware\Arkzen\MiddlewareTest\RequireJson::class);

// ── PingLog ─────────────────────────────
Route::middleware(['api', 'requireJson'])
    ->prefix('/api/middleware-test')
    ->group(function () {

        // Returns all ping logs — passes through requireJson middleware
        Route::get('/ping', [PingLogController::class, 'index']);

        // Create a ping log entry — blocked by requireJson if Content-Type is wrong
        Route::post('/ping', [PingLogController::class, 'store']);

    });
