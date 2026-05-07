<?php

// ============================================================
// ARKZEN GENERATED ROUTES — job-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:52:55.232776Z
// Resources: JobResult
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\JobTest\JobResultController;

// ── JobResult ─────────────────────────────
Route::middleware(['web'])
    ->prefix('/job-test')
    ->group(function () {

        // Get all job results
        Route::get('/results', [JobResultController::class, 'index']);

        // Dispatch a job
        Route::post('/dispatch', [JobResultController::class, 'store']);

    });
