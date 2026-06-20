<?php

// ============================================================
// ARKZEN GENERATED REQUEST — JobResultStoreRequest
// Tatemono: job-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:10.276944Z
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
