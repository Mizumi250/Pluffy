<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — body-endpoint-handler [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T07:57:57.876Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/body-endpoint-handler', function () {
        return \Inertia\Inertia::render('BodyEndpointHandler/Index');
    });

});
