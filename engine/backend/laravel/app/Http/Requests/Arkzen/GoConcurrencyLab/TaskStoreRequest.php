<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TaskStoreRequest
// Tatemono: go-concurrency-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:47.871679Z
// ============================================================

namespace App\Http\Requests\Arkzen\GoConcurrencyLab;

use Illuminate\Foundation\Http\FormRequest;

class TaskStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:120',
            'priority' => 'required|integer|min:1|max:5',
            'status' => 'required|in:queued,done',
        ];
    }

    public function messages(): array { return []; }
}
