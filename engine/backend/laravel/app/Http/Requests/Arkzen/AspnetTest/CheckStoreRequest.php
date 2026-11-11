<?php

// ============================================================
// ARKZEN GENERATED REQUEST — CheckStoreRequest
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:31.175085Z
// ============================================================

namespace App\Http\Requests\Arkzen\AspnetTest;

use Illuminate\Foundation\Http\FormRequest;

class CheckStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:120',
            'status' => 'sometimes|string|in:pending,passed,failed',
            'priority' => 'sometimes|integer|min:1',
            'done' => 'sometimes|boolean',
            'user_id' => 'sometimes|integer',
        ];
    }

    public function messages(): array { return []; }
}
