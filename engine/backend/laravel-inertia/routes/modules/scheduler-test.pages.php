<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — scheduler-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T23:55:11.702Z
// Pages: dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: dashboard
    Route::get('/scheduler-test/dashboard', function () {
        return \Inertia\Inertia::render('SchedulerTest/Dashboard');
    });

});
