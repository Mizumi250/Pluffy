<?php

// ============================================================
// ARKZEN GENERATED ROUTES — events-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T11:41:47.738734Z
// Resources: EventLog
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\EventsTest\EventLogController;

// ── EventLog ─────────────────────────────
Route::middleware(['web'])
    ->prefix('/events-test')
    ->group(function () {

        // Get event log entries
        Route::get('/log', [EventLogController::class, 'index']);

        // Fire an event
        Route::post('/fire', [EventLogController::class, 'store']);

        // Clear all log entries
        Route::post('/log/clear', [EventLogController::class, 'clearLog']);

    });
