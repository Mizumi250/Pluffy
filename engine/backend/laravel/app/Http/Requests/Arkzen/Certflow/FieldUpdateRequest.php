<?php

// ============================================================
// ARKZEN GENERATED REQUEST — FieldUpdateRequest
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T07:15:04.245553Z
// ============================================================

namespace App\Http\Requests\Arkzen\Certflow;

use Illuminate\Foundation\Http\FormRequest;

class FieldUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'label' => 'sometimes|string|max:100',
            'x' => 'sometimes|integer',
            'y' => 'sometimes|integer',
            'width' => 'sometimes|integer',
            'height' => 'sometimes|integer',
            'font_size' => 'sometimes|integer',
            'font_family' => 'sometimes|string|max:100',
            'font_weight' => 'sometimes|string|max:20',
            'font_style' => 'sometimes|string|max:20',
            'text_align' => 'sometimes|string|in:left,center,right',
            'color' => 'sometimes|string|max:20',
            'placeholder' => 'nullable|string|max:200',
            'layer_order' => 'sometimes|integer',
            'is_required' => 'sometimes|boolean',
        ];
    }

    public function messages(): array { return []; }
}
