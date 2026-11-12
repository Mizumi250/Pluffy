<?php

// ============================================================
// ARKZEN GENERATED REQUEST — NotificationStoreRequest
// Tatemono: notification-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:00.093908Z
// ============================================================

namespace App\Http\Requests\Arkzen\NotificationTest;

use Illuminate\Foundation\Http\FormRequest;

class NotificationStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'notification' => 'required|string',
        ];
    }

    public function messages(): array { return []; }
}
