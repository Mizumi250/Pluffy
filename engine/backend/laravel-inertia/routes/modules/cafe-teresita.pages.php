<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — cafe-teresita [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:20.285Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/cafe-teresita', function () {
        return \Inertia\Inertia::render('CafeTeresita/Index');
    });

});
