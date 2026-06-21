<?php

// ============================================================
// ARKZEN GENERATED REQUEST — ProbeResultStoreRequest
// Tatemono: body-endpoint-handler
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:30.628119Z
// ============================================================

namespace App\Http\Requests\Arkzen\BodyEndpointHandler;

use Illuminate\Foundation\Http\FormRequest;

class ProbeResultStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'source' => 'required|string|max:50',
            'probe' => 'required|string|max:100',
            'payload' => 'nullable|string',
        ];
    }

    public function messages(): array { return []; }
}
