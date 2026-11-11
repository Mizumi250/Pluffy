<?php

// ============================================================
// ARKZEN GENERATED REQUEST — SendLogBroadcastRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.159266Z
// ============================================================

namespace App\Http\Requests\Arkzen\ExpressTest2;

use Illuminate\Foundation\Http\FormRequest;

class SendLogBroadcastRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'channel_type' => 'required|string|in:public,private,presence',
            'target' => 'required|string',
        ];
    }

    public function messages(): array { return []; }
}
