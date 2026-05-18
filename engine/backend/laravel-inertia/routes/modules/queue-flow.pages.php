<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — queue-flow [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T13:03:17.277Z
// Pages: index, join, admin
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/queue-flow', function () {
        return \Inertia\Inertia::render('QueueFlow/Index');
    });

    // Page: join
    Route::get('/queue-flow/join', function () {
        return \Inertia\Inertia::render('QueueFlow/Join');
    });

    // Page: admin
    Route::get('/queue-flow/admin', function () {
        return \Inertia\Inertia::render('QueueFlow/Admin');
    });

    // Catch-all 404 — mirrors Next.js [...catchAll] and Vite wildcard route
    Route::get('/queue-flow/{any}', function () {
        return \Inertia\Inertia::render('QueueFlow/NotFound');
    })->where('any', '.*');

});
