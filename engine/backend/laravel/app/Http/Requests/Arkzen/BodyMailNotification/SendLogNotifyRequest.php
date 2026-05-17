<?php

// ============================================================
// ARKZEN GENERATED REQUEST — SendLogNotifyRequest
// Tatemono: body-mail-notification
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T01:23:43.989357Z
// ============================================================

namespace App\Http\Requests\Arkzen\BodyMailNotification;

use Illuminate\Foundation\Http\FormRequest;

class SendLogNotifyRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'notification' => 'required|string|in:action-required,summary',
            'message' => 'sometimes|string|max:255',
        ];
    }

    public function messages(): array { return []; }
}
