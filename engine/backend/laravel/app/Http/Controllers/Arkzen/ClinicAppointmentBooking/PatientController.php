<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — PatientController
// Tatemono: clinic-appointment-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:50.421250Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ClinicAppointmentBooking;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ClinicAppointmentBooking\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PatientController extends Controller
{
    /**
     * Get all patients
     */
    public function index(Request $request): JsonResponse
    {
        $query = Patient::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Create new patient
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:clinic_appointment_booking.clinic_appointment_booking_patients,email',
            'phone_number' => 'sometimes|string|max:15'
        ]);

        $patient = Patient::create($validated);

        return response()->json($patient, 201);
    }

    /**
     * Update patient
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:clinic_appointment_booking.clinic_appointment_booking_patients,email',
            'phone_number' => 'sometimes|string|max:15'
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    /**
     * Delete patient
     */
    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        return response()->json(['message' => 'Patient deleted']);
    }
}
