<?php

// ============================================================
// ARKZEN GENERATED REQUEST — QueueUpdateRequest
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-04T00:49:20.214229Z
// ============================================================

namespace App\Http\Requests\Arkzen\QueueFlow;

use Illuminate\Foundation\Http\FormRequest;

class QueueUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'is_active' => 'sometimes|boolean',
            'avg_wait_minutes' => 'sometimes|integer|min:1',
        ];
    }

    public function messages(): array { return []; }
}
