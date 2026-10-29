<?php

// ============================================================
// ARKZEN GENERATED REQUEST — AppointmentUpdateRequest
// Tatemono: clinic-appointment-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.110492Z
// ============================================================

namespace App\Http\Requests\Arkzen\ClinicAppointmentBooking;

use Illuminate\Foundation\Http\FormRequest;

class AppointmentUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'doctor_name' => 'nullable|string|max:255',
            'date_time' => 'nullable|date_format:Y-m-d H:i:s',
            'status' => 'nullable|string|in:pending,completed,cancelled',
        ];
    }

    public function messages(): array { return []; }
}
