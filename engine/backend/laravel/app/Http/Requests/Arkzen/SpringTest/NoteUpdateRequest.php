<?php

// ============================================================
// ARKZEN GENERATED REQUEST — NoteUpdateRequest
// Tatemono: spring-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:27:05.743829Z
// ============================================================

namespace App\Http\Requests\Arkzen\SpringTest;

use Illuminate\Foundation\Http\FormRequest;

class NoteUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:160',
            'body' => 'sometimes|string',
            'pinned' => 'sometimes|boolean',
        ];
    }

    public function messages(): array { return []; }
}
