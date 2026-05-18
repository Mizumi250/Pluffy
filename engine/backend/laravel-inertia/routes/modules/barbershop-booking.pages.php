<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — barbershop-booking [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T10:37:23.203Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/barbershop-booking', function () {
        return \Inertia\Inertia::render('BarbershopBooking/Index');
    });

});
