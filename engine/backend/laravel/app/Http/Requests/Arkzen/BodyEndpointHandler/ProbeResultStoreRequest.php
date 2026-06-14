<?php

// ============================================================
// ARKZEN GENERATED REQUEST — ProbeResultStoreRequest
// Tatemono: body-endpoint-handler
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T08:07:11.483814Z
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
