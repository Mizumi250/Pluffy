<?php

// ============================================================
// ARKZEN GENERATED REQUEST — MailLogStoreRequest
// Tatemono: mail-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T00:54:07.702979Z
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
