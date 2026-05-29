<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — new-updates-styles [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-29T02:41:50.330Z
// Pages: index, about, features
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/new-updates-styles', function () {
        return \Inertia\Inertia::render('NewUpdatesStyles/Index');
    });

    // Page: about
    Route::get('/new-updates-styles/about', function () {
        return \Inertia\Inertia::render('NewUpdatesStyles/About');
    });

    // Page: features
    Route::get('/new-updates-styles/features', function () {
        return \Inertia\Inertia::render('NewUpdatesStyles/Features');
    });

});
