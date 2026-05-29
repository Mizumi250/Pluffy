<?php

// ============================================================
// ARKZEN GENERATED ROUTES — body-endpoint-handler
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-29T02:41:47.051810Z
// Resources: ProbeResult
// Custom controllers: ProbeUtilController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\BodyEndpointHandler\ProbeResultController;
use App\Http\Controllers\Arkzen\BodyEndpointHandler\ProbeUtilController;

// ── ProbeResult ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/body-endpoint-handler')
    ->group(function () {

        // List all probe results
        Route::get('/probes', [ProbeResultController::class, 'index']);

        // Create a probe result entry — standard store, not body-injected, kept as baseline
        Route::post('/probes', [ProbeResultController::class, 'store']);

        // Custom endpoint — @arkzen:endpoint body injection. Echoes the request body back with metadata. Tests ControllerBuilder v7.0 body injection.
        Route::post('/echo', [ProbeResultController::class, 'echo']);

        // Custom endpoint — @arkzen:endpoint body injection. Returns aggregate counts from probe_results. Tests ControllerBuilder v7.0 body injection.
        Route::get('/stats', [ProbeResultController::class, 'stats']);

        // Delete a probe result
        Route::delete('/probes/{probeResult}', [ProbeResultController::class, 'destroy']);

    });

// ── Custom: ProbeUtilController ─────────────────────────────
Route::middleware(['api'])
    ->group(function () {
        Route::get('api/body-endpoint-handler/ping', [ProbeUtilController::class, 'ping']);
        Route::post('api/body-endpoint-handler/record-handler', [ProbeUtilController::class, 'recordHandler']);
        Route::get('api/body-endpoint-handler/latest', [ProbeUtilController::class, 'latest']);
    });
