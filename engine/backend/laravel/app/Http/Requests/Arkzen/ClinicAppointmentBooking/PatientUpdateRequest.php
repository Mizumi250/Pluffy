<?php

// ============================================================
// ARKZEN GENERATED REQUEST — PatientUpdateRequest
// Tatemono: clinic-appointment-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.104618Z
// ============================================================

namespace App\Http\Requests\Arkzen\ClinicAppointmentBooking;

use Illuminate\Foundation\Http\FormRequest;

class PatientUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:clinic_appointment_booking.clinic_appointment_booking_patients,email',
            'phone_number' => 'sometimes|string|max:15',
        ];
    }

    public function messages(): array { return []; }
}
