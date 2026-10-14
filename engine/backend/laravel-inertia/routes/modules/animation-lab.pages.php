<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — animation-lab [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:19.648Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/animation-lab', function () {
        return \Inertia\Inertia::render('AnimationLab/Index');
    });

});
