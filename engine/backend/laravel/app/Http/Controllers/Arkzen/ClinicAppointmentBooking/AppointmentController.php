<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — AppointmentController
// Tatemono: clinic-appointment-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:29.182339Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ClinicAppointmentBooking;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ClinicAppointmentBooking\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AppointmentController extends Controller
{
    /**
     * Get all appointments
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Create an appointment
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|integer|exists:clinic_appointment_booking.clinic_appointment_booking_patients,id',
            'doctor_name' => 'required|string|max:255',
            'date_time' => 'required|date_format:Y-m-d H:i:s',
            'status' => 'sometimes|string|in:pending,completed,cancelled'
        ]);

        $appointment = Appointment::create($validated);

        return response()->json($appointment, 201);
    }

    /**
     * Update an appointment
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'doctor_name' => 'nullable|string|max:255',
            'date_time' => 'nullable|date_format:Y-m-d H:i:s',
            'status' => 'nullable|string|in:pending,completed,cancelled'
        ]);

        $appointment->update($validated);

        return response()->json($appointment);
    }

    /**
     * Delete an appointment
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted']);
    }
}
