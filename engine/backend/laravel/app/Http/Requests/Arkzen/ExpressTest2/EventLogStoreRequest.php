<?php

// ============================================================
// ARKZEN GENERATED REQUEST — EventLogStoreRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T11:53:36.366277Z
// ============================================================

namespace App\Http\Requests\Arkzen\ExpressTest2;

use Illuminate\Foundation\Http\FormRequest;

class EventLogStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'event' => 'required|string|in:record-created',
            'payload' => 'sometimes|array',
        ];
    }

    public function messages(): array { return []; }
}
