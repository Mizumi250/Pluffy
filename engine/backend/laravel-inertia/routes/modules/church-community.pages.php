<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — church-community [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-08T01:35:29.000Z
// Pages: index, members, inventory, admin, login, register
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/church-community', function () {
        return \Inertia\Inertia::render('ChurchCommunity/Index');
    });

    // Page: members
    Route::get('/church-community/members', function () {
        return \Inertia\Inertia::render('ChurchCommunity/Members');
    });

    // Page: inventory
    Route::get('/church-community/inventory', function () {
        return \Inertia\Inertia::render('ChurchCommunity/Inventory');
    });

    // Page: admin
    Route::get('/church-community/admin', function () {
        return \Inertia\Inertia::render('ChurchCommunity/Admin');
    });

    // Page: login
    Route::get('/church-community/login', function () {
        return \Inertia\Inertia::render('ChurchCommunity/Login');
    });

    // Page: register
    Route::get('/church-community/register', function () {
        return \Inertia\Inertia::render('ChurchCommunity/Register');
    });

});
