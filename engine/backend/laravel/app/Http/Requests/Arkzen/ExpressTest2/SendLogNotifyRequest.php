<?php

// ============================================================
// ARKZEN GENERATED REQUEST — SendLogNotifyRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:44.627949Z
// ============================================================

namespace App\Http\Requests\Arkzen\ExpressTest2;

use Illuminate\Foundation\Http\FormRequest;

class SendLogNotifyRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'notification' => 'required|string',
        ];
    }

    public function messages(): array { return []; }
}
