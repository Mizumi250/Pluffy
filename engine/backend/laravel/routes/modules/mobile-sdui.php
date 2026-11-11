<?php

// ============================================================
// ARKZEN GENERATED ROUTES — mobile-sdui
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:54.659661Z
// Resources: UiRelease
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\MobileSdui\UiReleaseController;

// ── UiRelease ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/mobile-sdui')
    ->group(function () {

        // List published and scheduled mobile UI releases
        Route::get('/releases', [UiReleaseController::class, 'index']);

        // Publish a validated mobile button configuration
        Route::post('/releases', [UiReleaseController::class, 'store']);

    });
