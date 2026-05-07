<?php
// ============================================================
// ARKZEN ENGINE — HUB ROUTE [Inertia/Web]
// Serves the Arkzen Hub at GET /
// DO NOT EDIT DIRECTLY — engine-managed file.
// ============================================================

use Illuminate\Support\Facades\Route;

Route::middleware(['web'])->group(function () {
    Route::get('/', function () {
        return \Inertia\Inertia::render('Hub');
    });
});