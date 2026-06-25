<?php

// ============================================================
// ARKZEN GENERATED ROUTES — dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T01:16:55.987012Z
// Resources: Employee, TimeRecord, DtrSetting
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\DtrGeofencing\EmployeeController;
use App\Http\Controllers\Arkzen\DtrGeofencing\TimeRecordController;
use App\Http\Controllers\Arkzen\DtrGeofencing\DtrSettingController;

// ── Employee ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/dtr')
    ->group(function () {

        // Get all employees
        Route::get('/employees', [EmployeeController::class, 'index']);

        // Get single employee
        Route::get('/employees/{employee}', [EmployeeController::class, 'show']);

    });

// ── TimeRecord ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/dtr')
    ->group(function () {

        // Get all time records with employee
        Route::get('/records', [TimeRecordController::class, 'index']);

        // Get records for a specific employee
        Route::get('/my-records/{employee_id}', [TimeRecordController::class, 'my_records']);

        // Record a check-in
        Route::post('/check-in', [TimeRecordController::class, 'check_in']);

        // Record a check-out
        Route::post('/check-out', [TimeRecordController::class, 'check_out']);

    });

// ── DtrSetting ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/dtr')
    ->group(function () {

        // Get all settings
        Route::get('/settings', [DtrSettingController::class, 'index']);

        // Toggle geofencing on/off
        Route::post('/settings/toggle-geofencing', [DtrSettingController::class, 'toggle_geofencing']);

        // Update office location
        Route::post('/settings/office', [DtrSettingController::class, 'update_office']);

    });
