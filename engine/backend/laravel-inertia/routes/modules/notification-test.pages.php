<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — notification-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-24T01:58:07.600Z
// Pages: login, register, dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // No index page — redirect root to first landing page (mirrors vite/next behaviour)
    Route::redirect('/notification-test', '/notification-test/login');

    // Page: login
    Route::get('/notification-test/login', function () {
        return \Inertia\Inertia::render('NotificationTest/Login');
    });

    // Page: register
    Route::get('/notification-test/register', function () {
        return \Inertia\Inertia::render('NotificationTest/Register');
    });

    // Page: dashboard
    Route::get('/notification-test/dashboard', function () {
        return \Inertia\Inertia::render('NotificationTest/Dashboard');
    });

});
