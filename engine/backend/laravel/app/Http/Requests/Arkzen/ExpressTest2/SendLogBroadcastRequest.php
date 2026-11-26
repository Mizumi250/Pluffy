<?php

// ============================================================
// ARKZEN GENERATED REQUEST — SendLogBroadcastRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:34.908786Z
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
