<?php

// ============================================================
// ARKZEN GENERATED REQUEST — ItemUpdateRequest
// Tatemono: crud-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:02.872495Z
// ============================================================

namespace App\Http\Requests\Arkzen\CrudTest;

use Illuminate\Foundation\Http\FormRequest;

class ItemUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:active,pending,archived',
            'priority' => 'sometimes|integer|min:0',
            'tags' => 'nullable|string',
        ];
    }

    public function messages(): array { return []; }
}
