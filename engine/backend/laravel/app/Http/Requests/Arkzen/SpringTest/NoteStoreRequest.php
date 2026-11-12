<?php

// ============================================================
// ARKZEN GENERATED REQUEST — NoteStoreRequest
// Tatemono: spring-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:08.017681Z
// ============================================================

namespace App\Http\Requests\Arkzen\SpringTest;

use Illuminate\Foundation\Http\FormRequest;

class NoteStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:160',
            'body' => 'sometimes|string',
            'pinned' => 'sometimes|boolean',
        ];
    }

    public function messages(): array { return []; }
}
