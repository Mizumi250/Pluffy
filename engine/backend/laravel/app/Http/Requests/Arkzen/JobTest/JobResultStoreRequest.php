<?php

// ============================================================
// ARKZEN GENERATED REQUEST — JobResultStoreRequest
// Tatemono: job-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T08:28:12.557367Z
// ============================================================

namespace App\Http\Requests\Arkzen\JobTest;

use Illuminate\Foundation\Http\FormRequest;

class JobResultStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'job' => 'required|string',
        ];
    }

    public function messages(): array { return []; }
}
