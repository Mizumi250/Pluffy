<?php

// ============================================================
// ARKZEN GENERATED REQUEST — UnmetRequestPlanRequest
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:30.154796Z
// ============================================================

namespace App\Http\Requests\Arkzen\A2uiLab;

use Illuminate\Foundation\Http\FormRequest;

class UnmetRequestPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'message' => 'required|string|max:500',
        ];
    }

    public function messages(): array { return []; }
}
