<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — job-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-08T01:35:29.817Z
// Pages: dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // No index page — redirect root to first landing page (mirrors vite/next behaviour)
    Route::redirect('/job-test', '/job-test/dashboard');

    // Page: dashboard
    Route::get('/job-test/dashboard', function () {
        return \Inertia\Inertia::render('JobTest/Dashboard');
    });

});
