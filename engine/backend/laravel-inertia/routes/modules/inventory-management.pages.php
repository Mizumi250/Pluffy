<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — inventory-management [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:27:20.069Z
// Pages: index
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: index
    Route::get('/inventory-management', function () {
        return \Inertia\Inertia::render('InventoryManagement/Index');
    });

});
