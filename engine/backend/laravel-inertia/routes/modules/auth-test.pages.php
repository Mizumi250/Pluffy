<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — auth-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T21:51:46.077Z
// Pages: login, register, dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // No index page — redirect root to first landing page (mirrors vite/next behaviour)
    Route::redirect('/auth-test', '/auth-test/login');

    // Page: login
    Route::get('/auth-test/login', function () {
        return \Inertia\Inertia::render('AuthTest/Login');
    });

    // Page: register
    Route::get('/auth-test/register', function () {
        return \Inertia\Inertia::render('AuthTest/Register');
    });

    // Page: dashboard
    Route::get('/auth-test/dashboard', function () {
        return \Inertia\Inertia::render('AuthTest/Dashboard');
    });

});
