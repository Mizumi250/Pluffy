<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — visual-lab [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T07:49:37.417Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/visual-lab', function () {
        return \Inertia\Inertia::render('VisualLab/Index');
    });

});
