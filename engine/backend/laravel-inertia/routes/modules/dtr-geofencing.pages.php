<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — dtr-geofencing [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-16T10:35:15.710Z
// Pages: index, admin
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/dtr-geofencing', function () {
        return \Inertia\Inertia::render('DtrGeofencing/Index');
    });

    // Page: admin
    Route::get('/dtr-geofencing/admin', function () {
        return \Inertia\Inertia::render('DtrGeofencing/Admin');
    });

});
