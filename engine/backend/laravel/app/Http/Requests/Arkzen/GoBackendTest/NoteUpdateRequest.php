<?php

// ============================================================
// ARKZEN GENERATED REQUEST — NoteUpdateRequest
// Tatemono: go-backend-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:47.313642Z
// ============================================================

namespace App\Http\Requests\Arkzen\GoBackendTest;

use Illuminate\Foundation\Http\FormRequest;

class NoteUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:120',
            'body' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array { return []; }
}
