<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TestRecordStoreRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:44.557107Z
// ============================================================

namespace App\Http\Requests\Arkzen\ExpressTest2;

use Illuminate\Foundation\Http\FormRequest;

class TestRecordStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'status' => 'sometimes|string|in:open,closed',
            'priority' => 'sometimes|integer|min:1',
            'done' => 'sometimes|boolean',
        ];
    }

    public function messages(): array { return []; }
}
