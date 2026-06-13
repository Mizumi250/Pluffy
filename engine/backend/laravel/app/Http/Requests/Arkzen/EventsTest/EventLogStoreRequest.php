<?php

// ============================================================
// ARKZEN GENERATED REQUEST — EventLogStoreRequest
// Tatemono: events-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T09:40:28.700566Z
// ============================================================

namespace App\Http\Requests\Arkzen\EventsTest;

use Illuminate\Foundation\Http\FormRequest;

class EventLogStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'event' => 'required|string',
            'payload' => 'nullable|array',
        ];
    }

    public function messages(): array { return []; }
}
