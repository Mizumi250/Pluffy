<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — upload-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:37:43.086Z
// Pages: dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // Page: dashboard
    Route::get('/upload-test/dashboard', function () {
        return \Inertia\Inertia::render('UploadTest/Dashboard');
    });

});
