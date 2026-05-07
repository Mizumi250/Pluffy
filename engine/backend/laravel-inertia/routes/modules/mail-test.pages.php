<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — mail-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:37:41.648Z
// Pages: login, register, dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
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
