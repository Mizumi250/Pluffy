<?php

// ============================================================
// ARKZEN GENERATED ROUTES — jo-payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-13T12:23:04.712091Z
// Resources: JobOrder
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\JoPayroll\JobOrderController;

// ── JobOrder ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/jo-payroll')
    ->group(function () {

        // List all job orders
        Route::get('/job-orders', [JobOrderController::class, 'index']);

        // Create a new job order
        Route::post('/job-orders', [JobOrderController::class, 'store']);

        // Get single job order
        Route::get('/job-orders/{jobOrder}', [JobOrderController::class, 'show']);

        // Update job order
        Route::put('/job-orders/{jobOrder}', [JobOrderController::class, 'update']);

        // Delete job order
        Route::delete('/job-orders/{jobOrder}', [JobOrderController::class, 'destroy']);

        // Get payroll summary statistics
        Route::get('/job-orders/stats/summary', [JobOrderController::class, 'summary']);

        // Get job orders by payroll group
        Route::get('/job-orders/group/{group}', [JobOrderController::class, 'byGroup']);

        // Get appointment sequence list
        Route::get('/job-orders/appointments/list', [JobOrderController::class, 'appointments']);

    });
