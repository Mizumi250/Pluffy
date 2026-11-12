<?php

// ============================================================
// ARKZEN GENERATED REQUEST — NoteStoreRequest
// Tatemono: rust-backend-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:04.250312Z
// ============================================================

namespace App\Http\Requests\Arkzen\RustBackendTest;

use Illuminate\Foundation\Http\FormRequest;

class NoteStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:120',
            'body' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array { return []; }
}
