<?php

// ============================================================
// ARKZEN GENERATED REQUEST — QueueStoreRequest
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T07:39:06.515799Z
// ============================================================

namespace App\Http\Requests\Arkzen\QueueFlow;

use Illuminate\Foundation\Http\FormRequest;

class QueueStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prefix' => 'required|string|max:5',
            'avg_wait_minutes' => 'sometimes|integer|min:1',
        ];
    }

    public function messages(): array { return []; }
}
