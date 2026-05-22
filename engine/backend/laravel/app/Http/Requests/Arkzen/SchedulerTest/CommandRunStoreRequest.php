<?php

// ============================================================
// ARKZEN GENERATED REQUEST — CommandRunStoreRequest
// Tatemono: scheduler-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-22T23:38:12.291216Z
// ============================================================

namespace App\Http\Requests\Arkzen\SchedulerTest;

use Illuminate\Foundation\Http\FormRequest;

class CommandRunStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'command' => 'required|string',
            'triggered_by' => 'sometimes|string',
        ];
    }

    public function messages(): array { return []; }
}
