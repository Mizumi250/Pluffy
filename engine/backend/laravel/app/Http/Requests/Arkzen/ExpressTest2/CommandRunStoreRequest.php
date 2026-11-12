<?php

// ============================================================
// ARKZEN GENERATED REQUEST — CommandRunStoreRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:44.579290Z
// ============================================================

namespace App\Http\Requests\Arkzen\ExpressTest2;

use Illuminate\Foundation\Http\FormRequest;

class CommandRunStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'command' => 'required|string|in:cleanup',
            'triggered_by' => 'sometimes|string',
        ];
    }

    public function messages(): array { return []; }
}
