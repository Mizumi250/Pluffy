<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — errors-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-15T04:47:54.887Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/errors-test', function () {
        return \Inertia\Inertia::render('ErrorsTest/Index');
    });

});
