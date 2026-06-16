<?php

// ============================================================
// ARKZEN GENERATED REQUEST — JobOrderUpdateRequest
// Tatemono: jo-payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:44.445484Z
// ============================================================

namespace App\Http\Requests\Arkzen\JoPayroll;

use Illuminate\Foundation\Http\FormRequest;

class JobOrderUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'jor_number' => 'integer|min:0',
            'name_of_jo' => 'string|max:255',
            'job_title' => 'string|max:255',
            'funding' => 'string|max:255',
            'basic_pay' => 'numeric|min:0',
            'disbursement_type' => 'string|in:CASH,ATM',
            'status' => 'string|in:active,inactive',
        ];
    }

    public function messages(): array { return []; }
}
