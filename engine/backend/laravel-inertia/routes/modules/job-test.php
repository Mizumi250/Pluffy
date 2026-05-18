<?php

// ============================================================
// ARKZEN GENERATED ROUTES — job-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-18T12:31:47.486234Z
// Resources: JobResult
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\JobTest\JobResultController;

// ── JobResult ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/job-test')
    ->group(function () {

        // Get all job results
        Route::get('/results', [JobResultController::class, 'index']);

        // Dispatch a job
        Route::post('/dispatch', [JobResultController::class, 'store']);

    });
