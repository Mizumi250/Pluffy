<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — upload-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T13:18:33.050Z
// Pages: dashboard
// ============================================================

use Illuminate\Support\Facades\Route;

// ── Inertia Page Routes ──────────────────────────────────────
Route::middleware(['web'])->group(function () {
    // No index page — redirect root to first landing page (mirrors vite/next behaviour)
    Route::redirect('/upload-test', '/upload-test/dashboard');

    // Page: dashboard
    Route::get('/upload-test/dashboard', function () {
        return \Inertia\Inertia::render('UploadTest/Dashboard');
    });

});
