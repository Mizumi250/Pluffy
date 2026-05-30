<?php

// ============================================================
// ARKZEN GENERATED REQUEST — JobResultStoreRequest
// Tatemono: job-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T04:53:18.714494Z
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
