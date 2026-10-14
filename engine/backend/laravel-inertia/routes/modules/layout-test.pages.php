<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — layout-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:21.566Z
// Pages: index, panel, deep, guard-auth, chain-auth, guard-guest, chain-guest
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/layout-test', function () {
        return \Inertia\Inertia::render('LayoutTest/Index');
    });

    // Page: panel
    Route::get('/layout-test/panel', function () {
        return \Inertia\Inertia::render('LayoutTest/Panel');
    });

    // Page: deep
    Route::get('/layout-test/deep', function () {
        return \Inertia\Inertia::render('LayoutTest/Deep');
    });

    // Page: guard-auth
    Route::get('/layout-test/guard-auth', function () {
        return \Inertia\Inertia::render('LayoutTest/GuardAuth');
    });

    // Page: chain-auth
    Route::get('/layout-test/chain-auth', function () {
        return \Inertia\Inertia::render('LayoutTest/ChainAuth');
    });

    // Page: guard-guest
    Route::get('/layout-test/guard-guest', function () {
        return \Inertia\Inertia::render('LayoutTest/GuardGuest');
    });

    // Page: chain-guest
    Route::get('/layout-test/chain-guest', function () {
        return \Inertia\Inertia::render('LayoutTest/ChainGuest');
    });

    // Catch-all 404 — mirrors Next.js [...catchAll] and Vite wildcard route
    Route::get('/layout-test/{any}', function () {
        return \Inertia\Inertia::render('LayoutTest/NotFound');
    })->where('any', '.*');

});
