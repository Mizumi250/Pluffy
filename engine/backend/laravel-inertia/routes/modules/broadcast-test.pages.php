<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — broadcast-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:37:40.861Z
// Pages: login, register, dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
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
