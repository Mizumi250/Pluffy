<?php

// ============================================================
// ARKZEN GENERATED REQUEST — SendLogBroadcastRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:14:17.240533Z
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
