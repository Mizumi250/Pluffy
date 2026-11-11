<?php

// ============================================================
// ARKZEN GENERATED ROUTES — go-concurrency-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:39.421886Z
// Resources: Task
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\GoConcurrencyLab\TaskController;

// ── Task ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/go-concurrency-lab/tasks')
    ->group(function () {

        // index
        Route::get('/', [TaskController::class, 'index']);

        // store
        Route::post('/', [TaskController::class, 'store']);

    });
