<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — broadcast-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T09:39:39.394Z
// Pages: login, register, dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // No index page — redirect root to first landing page (mirrors vite/next behaviour)
    Route::redirect('/broadcast-test', '/broadcast-test/login');

    // Page: login
    Route::get('/broadcast-test/login', function () {
        return \Inertia\Inertia::render('BroadcastTest/Login');
    });

    // Page: register
    Route::get('/broadcast-test/register', function () {
        return \Inertia\Inertia::render('BroadcastTest/Register');
    });

    // Page: dashboard
    Route::get('/broadcast-test/dashboard', function () {
        return \Inertia\Inertia::render('BroadcastTest/Dashboard');
    });

});
