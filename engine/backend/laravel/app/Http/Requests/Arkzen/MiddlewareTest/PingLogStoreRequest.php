<?php

// ============================================================
// ARKZEN GENERATED REQUEST — PingLogStoreRequest
// Tatemono: middleware-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T14:14:48.943827Z
// ============================================================

namespace App\Http\Requests\Arkzen\MiddlewareTest;

use Illuminate\Foundation\Http\FormRequest;

class PingLogStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'message' => 'required|string|max:255',
            'headers_ok' => 'sometimes|boolean',
        ];
    }

    public function messages(): array { return []; }
}
