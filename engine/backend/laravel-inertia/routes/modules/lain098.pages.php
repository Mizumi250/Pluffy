<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — lain098 [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:21.501Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/lain098', function () {
        return \Inertia\Inertia::render('Lain098/Index');
    });

    // Catch-all 404 — mirrors Next.js [...catchAll] and Vite wildcard route
    Route::get('/lain098/{any}', function () {
        return \Inertia\Inertia::render('Lain098/NotFound');
    })->where('any', '.*');

});
