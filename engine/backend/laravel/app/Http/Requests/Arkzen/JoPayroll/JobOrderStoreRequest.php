<?php

// ============================================================
// ARKZEN GENERATED REQUEST — JobOrderStoreRequest
// Tatemono: jo-payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-28T23:23:13.836227Z
// ============================================================

namespace App\Http\Requests\Arkzen\JoPayroll;

use Illuminate\Foundation\Http\FormRequest;

class JobOrderStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'jor_number' => 'required|integer|min:0',
            'name_of_jo' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'funding' => 'required|string|max:255',
            'basic_pay' => 'required|numeric|min:0',
            'disbursement_type' => 'required|string|in:CASH,ATM',
            'status' => 'string|in:active,inactive',
        ];
    }

    public function messages(): array { return []; }
}
