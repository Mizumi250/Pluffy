<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — shikaku [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:22.363Z
// Pages: index, editor
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/shikaku', function () {
        return \Inertia\Inertia::render('Shikaku/Index');
    });

    // Page: editor
    Route::get('/shikaku/editor', function () {
        return \Inertia\Inertia::render('Shikaku/Editor');
    });

});
