<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — shan-shan [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:22.188Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/shan-shan', function () {
        return \Inertia\Inertia::render('ShanShan/Index');
    });

});
