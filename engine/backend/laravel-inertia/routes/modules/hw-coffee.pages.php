<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — hw-coffee [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:20.932Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/hw-coffee', function () {
        return \Inertia\Inertia::render('HwCoffee/Index');
    });

});
