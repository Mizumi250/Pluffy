<?php

// ============================================================
// ARKZEN GENERATED ROUTES — scheduler-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-09T01:33:44.638664Z
// Resources: CommandRun
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\SchedulerTest\CommandRunController;

// ── CommandRun ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/scheduler-test')
    ->group(function () {

        // Get all command run records
        Route::get('/runs', [CommandRunController::class, 'index']);

        // Execute a command and record the result
        Route::post('/run', [CommandRunController::class, 'store']);

        // Clear all run records
        Route::delete('/runs', [CommandRunController::class, 'destroy']);

    });
