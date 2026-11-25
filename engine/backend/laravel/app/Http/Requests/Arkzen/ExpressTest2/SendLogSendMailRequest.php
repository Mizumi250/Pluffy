<?php

// ============================================================
// ARKZEN GENERATED REQUEST — SendLogSendMailRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-25T01:29:18.343818Z
// ============================================================

namespace App\Http\Requests\Arkzen\ExpressTest2;

use Illuminate\Foundation\Http\FormRequest;

class SendLogSendMailRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'mail' => 'required|string',
            'to' => 'required|email',
        ];
    }

    public function messages(): array { return []; }
}
