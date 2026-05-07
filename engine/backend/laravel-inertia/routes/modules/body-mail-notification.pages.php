<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — body-mail-notification [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:37:40.375Z
// Pages: login, register, dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: login
    Route::get('/body-mail-notification/login', function () {
        return \Inertia\Inertia::render('BodyMailNotification/Login');
    });

    // Page: register
    Route::get('/body-mail-notification/register', function () {
        return \Inertia\Inertia::render('BodyMailNotification/Register');
    });

    // Page: dashboard
    Route::get('/body-mail-notification/dashboard', function () {
        return \Inertia\Inertia::render('BodyMailNotification/Dashboard');
    });

});
