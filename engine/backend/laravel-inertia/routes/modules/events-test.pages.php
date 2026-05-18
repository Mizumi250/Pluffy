<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — events-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T13:18:29.995Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/events-test', function () {
        return \Inertia\Inertia::render('EventsTest/Index');
    });

});
