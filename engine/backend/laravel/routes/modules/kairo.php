<?php

// ============================================================
// ARKZEN GENERATED ROUTES — kairo
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-25T01:29:25.093512Z
// Resources: Chip
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\Kairo\ChipController;

// ── Chip ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/kairo')
    ->group(function () {

        // List chips saved to the shared library
        Route::get('/chips', [ChipController::class, 'index']);

        // Save a chip blueprint to the shared library
        Route::post('/chips', [ChipController::class, 'store']);

    });
