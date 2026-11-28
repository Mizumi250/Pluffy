<?php

// ============================================================
// ARKZEN GENERATED REQUEST — ChipStoreRequest
// Tatemono: kairo
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:53:54.209664Z
// ============================================================

namespace App\Http\Requests\Arkzen\Kairo;

use Illuminate\Foundation\Http\FormRequest;

class ChipStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:60',
            'author' => 'sometimes|string|max:60',
            'note' => 'sometimes|string|max:160',
            'blueprint' => 'required|string',
        ];
    }

    public function messages(): array { return []; }
}
