<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — crud-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-08T00:27:43.279Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/crud-test', function () {
        return \Inertia\Inertia::render('CrudTest/Index');
    });

});
