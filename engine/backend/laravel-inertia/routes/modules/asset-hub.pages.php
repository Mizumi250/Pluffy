<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — asset-hub [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-24T02:29:33.189Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/asset-hub', function () {
        return \Inertia\Inertia::render('AssetHub/Index');
    });

});
