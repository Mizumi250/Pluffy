<?php

// ============================================================
// ARKZEN GENERATED REQUEST — ItemUpdateRequest
// Tatemono: crud-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T07:22:15.953043Z
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
