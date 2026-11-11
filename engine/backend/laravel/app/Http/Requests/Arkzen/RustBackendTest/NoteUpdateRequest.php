<?php

// ============================================================
// ARKZEN GENERATED REQUEST — NoteUpdateRequest
// Tatemono: rust-backend-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:27:01.760522Z
// ============================================================

namespace App\Http\Requests\Arkzen\RustBackendTest;

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
