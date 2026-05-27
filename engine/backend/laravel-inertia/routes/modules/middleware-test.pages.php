<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — middleware-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-27T12:14:48.125Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/middleware-test', function () {
        return \Inertia\Inertia::render('MiddlewareTest/Index');
    });

});
