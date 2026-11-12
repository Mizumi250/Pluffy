<?php

// ============================================================
// ARKZEN GENERATED REQUEST — CheckUpdateRequest
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:33.493477Z
// ============================================================

namespace App\Http\Requests\Arkzen\AspnetTest;

use Illuminate\Foundation\Http\FormRequest;

class CheckUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:120',
            'status' => 'sometimes|string|in:pending,passed,failed',
            'priority' => 'sometimes|integer|min:1',
            'done' => 'sometimes|boolean',
        ];
    }

    public function messages(): array { return []; }
}
