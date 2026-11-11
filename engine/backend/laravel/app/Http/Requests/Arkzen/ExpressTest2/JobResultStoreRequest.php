<?php

// ============================================================
// ARKZEN GENERATED REQUEST — JobResultStoreRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.144493Z
// ============================================================

namespace App\Http\Requests\Arkzen\ExpressTest2;

use Illuminate\Foundation\Http\FormRequest;

class JobResultStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'job' => 'required|string|in:process-record,always-fails',
        ];
    }

    public function messages(): array { return []; }
}
