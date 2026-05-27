<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — scheduler-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-27T12:14:50.124Z
// Pages: dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // No index page — redirect root to first landing page (mirrors vite/next behaviour)
    Route::redirect('/scheduler-test', '/scheduler-test/dashboard');

    // Page: dashboard
    Route::get('/scheduler-test/dashboard', function () {
        return \Inertia\Inertia::render('SchedulerTest/Dashboard');
    });

});
