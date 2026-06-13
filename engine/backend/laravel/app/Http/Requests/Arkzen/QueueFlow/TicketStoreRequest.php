<?php

// ============================================================
// ARKZEN GENERATED REQUEST — TicketStoreRequest
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T10:20:30.984294Z
// ============================================================

namespace App\Http\Requests\Arkzen\QueueFlow;

use Illuminate\Foundation\Http\FormRequest;

class TicketStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'queue_id' => 'required|integer|exists:queue_flow.queue_flow_queues,id',
            'customer_name' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array { return []; }
}
