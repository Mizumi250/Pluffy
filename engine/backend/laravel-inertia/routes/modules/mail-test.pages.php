<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — mail-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-15T21:28:32.200Z
// Pages: login, register, dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // No index page — redirect root to first landing page (mirrors vite/next behaviour)
    Route::redirect('/mail-test', '/mail-test/login');

    // Page: login
    Route::get('/mail-test/login', function () {
        return \Inertia\Inertia::render('MailTest/Login');
    });

    // Page: register
    Route::get('/mail-test/register', function () {
        return \Inertia\Inertia::render('MailTest/Register');
    });

    // Page: dashboard
    Route::get('/mail-test/dashboard', function () {
        return \Inertia\Inertia::render('MailTest/Dashboard');
    });

});
