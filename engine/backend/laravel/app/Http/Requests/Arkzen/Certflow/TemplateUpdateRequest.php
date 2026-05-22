<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TemplateUpdateRequest
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-22T05:33:05.410312Z
// ============================================================

namespace App\Http\Requests\Arkzen\Certflow;

use Illuminate\Foundation\Http\FormRequest;

class TemplateUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'global_font' => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array { return []; }
}
