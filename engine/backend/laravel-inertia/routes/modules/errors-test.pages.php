<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — errors-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T09:39:40.480Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/errors-test', function () {
        return \Inertia\Inertia::render('ErrorsTest/Index');
    });

    // Catch-all 404 — mirrors Next.js [...catchAll] and Vite wildcard route
    Route::get('/errors-test/{any}', function () {
        return \Inertia\Inertia::render('ErrorsTest/NotFound');
    })->where('any', '.*');

});
