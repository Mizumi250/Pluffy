<?php

// ============================================================
// ARKZEN GENERATED ROUTES — clinic-appointment-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:32.624820Z
// Resources: Patient, Appointment
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\ClinicAppointmentBooking\PatientController;
use App\Http\Controllers\Arkzen\ClinicAppointmentBooking\AppointmentController;

// ── Patient ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/clinic-appointment-booking/patients')
    ->group(function () {

        // Get all patients
        Route::get('/', [PatientController::class, 'index']);

        // Create new patient
        Route::post('/', [PatientController::class, 'store']);

        // Update patient
        Route::put('/{patient}', [PatientController::class, 'update']);

        // Delete patient
        Route::delete('/{patient}', [PatientController::class, 'destroy']);

    });

// ── Appointment ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/clinic-appointment-booking/appointments')
    ->group(function () {

        // Get all appointments
        Route::get('/', [AppointmentController::class, 'index']);

        // Create an appointment
        Route::post('/', [AppointmentController::class, 'store']);

        // Update an appointment
        Route::put('/{appointment}', [AppointmentController::class, 'update']);

        // Delete an appointment
        Route::delete('/{appointment}', [AppointmentController::class, 'destroy']);

    });
