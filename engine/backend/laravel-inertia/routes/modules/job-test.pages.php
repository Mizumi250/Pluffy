<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — job-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:52:55.144Z
// Pages: dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: dashboard
    Route::get('/job-test/dashboard', function () {
        return \Inertia\Inertia::render('JobTest/Dashboard');
    });

});
