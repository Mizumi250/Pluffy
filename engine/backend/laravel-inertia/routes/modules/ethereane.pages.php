<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — ethereane [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:20.753Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/ethereane', function () {
        return \Inertia\Inertia::render('Ethereane/Index');
    });

});
