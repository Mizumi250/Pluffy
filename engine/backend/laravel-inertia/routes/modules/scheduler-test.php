<?php

// ============================================================
// ARKZEN GENERATED ROUTES — scheduler-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:37:43.049956Z
// Resources: CommandRun
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\SchedulerTest\CommandRunController;

// ── CommandRun ─────────────────────────────
Route::middleware(['web'])
    ->prefix('/scheduler-test')
    ->group(function () {

        // Get all command run records
        Route::get('/runs', [CommandRunController::class, 'index']);

        // Execute a command and record the result
        Route::post('/run', [CommandRunController::class, 'store']);

        // Clear all run records
        Route::delete('/runs', [CommandRunController::class, 'destroy']);

    });
