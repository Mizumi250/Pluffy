<?php

// ============================================================
// ARKZEN GENERATED REQUEST — AppointmentStoreRequest
// Tatemono: clinic-appointment-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:29.134697Z
// ============================================================

namespace App\Http\Requests\Arkzen\ClinicAppointmentBooking;

use Illuminate\Foundation\Http\FormRequest;

class AppointmentStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'patient_id' => 'required|integer|exists:clinic_appointment_booking.clinic_appointment_booking_patients,id',
            'doctor_name' => 'required|string|max:255',
            'date_time' => 'required|date_format:Y-m-d H:i:s',
            'status' => 'sometimes|string|in:pending,completed,cancelled',
        ];
    }

    public function messages(): array { return []; }
}
