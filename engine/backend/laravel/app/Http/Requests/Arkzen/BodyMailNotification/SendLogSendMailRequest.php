<?php

// ============================================================
// ARKZEN GENERATED REQUEST — SendLogSendMailRequest
// Tatemono: body-mail-notification
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T07:19:24.248806Z
// ============================================================

namespace App\Http\Requests\Arkzen\BodyMailNotification;

use Illuminate\Foundation\Http\FormRequest;

class SendLogSendMailRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'mail' => 'required|string|in:welcome,receipt,alert',
            'to' => 'required|email',
        ];
    }

    public function messages(): array { return []; }
}
