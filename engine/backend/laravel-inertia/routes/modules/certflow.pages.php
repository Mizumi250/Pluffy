<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — certflow [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T09:39:39.519Z
// Pages: login, dashboard, fill, verify
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // No index page — redirect root to first landing page (mirrors vite/next behaviour)
    Route::redirect('/certflow', '/certflow/login');

    // Page: login
    Route::get('/certflow/login', function () {
        return \Inertia\Inertia::render('Certflow/Login');
    });

    // Page: dashboard
    Route::get('/certflow/dashboard', function () {
        return \Inertia\Inertia::render('Certflow/Dashboard');
    });

    // Page: fill
    Route::get('/certflow/fill', function () {
        return \Inertia\Inertia::render('Certflow/Fill');
    });

    // Page: verify
    Route::get('/certflow/verify', function () {
        return \Inertia\Inertia::render('Certflow/Verify');
    });

});
