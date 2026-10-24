<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TimeRecordCheck_outRequest
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:35.201617Z
// ============================================================

namespace App\Http\Requests\Arkzen\DtrGeofencing;

use Illuminate\Foundation\Http\FormRequest;

class TimeRecordCheck_outRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|integer|exists:dtr_geofencing.dtr_geofencing_employees,id',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ];
    }

    public function messages(): array { return []; }
}
