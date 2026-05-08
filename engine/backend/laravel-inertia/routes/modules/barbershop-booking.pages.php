<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — barbershop-booking [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-08T02:18:53.669Z
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
