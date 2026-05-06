<?php

// ============================================================
// ARKZEN GENERATED REQUEST — MailLogStoreRequest
// Tatemono: mail-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T06:08:29.140469Z
// ============================================================

namespace App\Http\Requests\Arkzen\MailTest;

use Illuminate\Foundation\Http\FormRequest;

class MailLogStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'mail' => 'required|string',
            'to' => 'required|email',
            'data' => 'array',
        ];
    }

    public function messages(): array { return []; }
}
