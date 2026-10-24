<?php

// ============================================================
// ARKZEN GENERATED REQUEST — ShikakuProjectUpdateRequest
// Tatemono: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:54.491470Z
// ============================================================

namespace App\Http\Requests\Arkzen\Shikaku;

use Illuminate\Foundation\Http\FormRequest;

class ShikakuProjectUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'thumbnail' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array { return []; }
}
