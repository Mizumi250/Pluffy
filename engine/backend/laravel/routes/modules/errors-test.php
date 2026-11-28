<?php

// ============================================================
// ARKZEN GENERATED ROUTES — errors-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:14:14.253833Z
// Resources: 
// Custom controllers: SimulateController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\ErrorsTest\SimulateController;

// ── Custom: SimulateController ─────────────────────────────
Route::middleware(['api'])
    ->group(function () {
        Route::get('api/errors-test/simulate/{code}', [SimulateController::class, 'simulate']);
    });
