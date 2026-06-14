<?php

// ============================================================
// ARKZEN GENERATED REQUEST — CommandRunStoreRequest
// Tatemono: scheduler-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:29:00.422604Z
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
