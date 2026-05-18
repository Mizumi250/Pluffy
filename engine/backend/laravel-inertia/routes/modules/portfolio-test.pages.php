<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — portfolio-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T12:04:25.624Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/portfolio-test', function () {
        return \Inertia\Inertia::render('PortfolioTest/Index');
    });

});
