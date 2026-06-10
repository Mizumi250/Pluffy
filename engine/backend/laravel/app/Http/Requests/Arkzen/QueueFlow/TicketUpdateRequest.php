<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TicketUpdateRequest
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-10T18:08:24.655910Z
// ============================================================

namespace App\Http\Requests\Arkzen\QueueFlow;

use Illuminate\Foundation\Http\FormRequest;

class TicketUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:waiting,serving,done,skipped',
        ];
    }

    public function messages(): array { return []; }
}
