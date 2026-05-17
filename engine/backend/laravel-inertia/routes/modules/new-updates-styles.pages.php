<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — new-updates-styles [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T13:37:07.106Z
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
