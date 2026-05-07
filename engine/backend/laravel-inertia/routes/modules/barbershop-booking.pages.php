<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — barbershop-booking [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:37:40.041Z
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
