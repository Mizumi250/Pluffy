<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TicketUpdateRequest
// Tatemono: fastapi-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:36.250398Z
// ============================================================

namespace App\Http\Requests\Arkzen\FastapiTest;

use Illuminate\Foundation\Http\FormRequest;

class TicketUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:open,closed',
        ];
    }

    public function messages(): array { return []; }
}
