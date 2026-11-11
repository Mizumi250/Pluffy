<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TicketStoreRequest
// Tatemono: fastapi-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:33.457647Z
// ============================================================

namespace App\Http\Requests\Arkzen\FastapiTest;

use Illuminate\Foundation\Http\FormRequest;

class TicketStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'status' => 'sometimes|string|in:open,closed',
            'priority' => 'sometimes|integer|min:1',
            'done' => 'sometimes|boolean',
            'user_id' => 'sometimes|integer',
        ];
    }

    public function messages(): array { return []; }
}
