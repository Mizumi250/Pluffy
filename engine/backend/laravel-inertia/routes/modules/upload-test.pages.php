<?php
// ============================================================
// ARKZEN GENERATED PAGE ROUTES — upload-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-08T00:27:46.544Z
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
