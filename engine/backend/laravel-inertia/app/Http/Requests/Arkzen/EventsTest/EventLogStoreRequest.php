<?php

// ============================================================
// ARKZEN GENERATED REQUEST — EventLogStoreRequest
// Tatemono: events-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T13:37:06.505953Z
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
