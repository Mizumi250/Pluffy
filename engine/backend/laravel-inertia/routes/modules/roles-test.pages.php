<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — roles-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:52:55.906Z
// Pages: login, register, dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: login
    Route::get('/roles-test/login', function () {
        return \Inertia\Inertia::render('RolesTest/Login');
    });

    // Page: register
    Route::get('/roles-test/register', function () {
        return \Inertia\Inertia::render('RolesTest/Register');
    });

    // Page: dashboard
    Route::get('/roles-test/dashboard', function () {
        return \Inertia\Inertia::render('RolesTest/Dashboard');
    });

});
