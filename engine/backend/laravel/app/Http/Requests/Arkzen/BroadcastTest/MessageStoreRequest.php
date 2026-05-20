<?php

// ============================================================
// ARKZEN GENERATED REQUEST — MessageStoreRequest
// Tatemono: broadcast-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-20T06:38:21.870570Z
// ============================================================

namespace App\Http\Requests\Arkzen\BroadcastTest;

use Illuminate\Foundation\Http\FormRequest;

class MessageStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'content' => 'required|string|max:500',
            'channel_type' => 'sometimes|string|max:50',
        ];
    }

    public function messages(): array { return []; }
}
