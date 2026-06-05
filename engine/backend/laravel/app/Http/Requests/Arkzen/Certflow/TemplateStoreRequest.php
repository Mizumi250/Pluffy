<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TemplateStoreRequest
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-05T13:13:31.881462Z
// ============================================================

namespace App\Http\Requests\Arkzen\Certflow;

use Illuminate\Foundation\Http\FormRequest;

class TemplateStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'global_font' => 'sometimes|string|max:100',
        ];
    }

    public function messages(): array { return []; }
}
