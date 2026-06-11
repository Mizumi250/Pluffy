<?php

// ============================================================
// ARKZEN GENERATED REQUEST — MailLogStoreRequest
// Tatemono: mail-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-11T12:58:13.074149Z
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
