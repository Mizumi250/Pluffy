<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — TicketResource
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-09T11:45:14.850248Z
// ============================================================

namespace App\Http\Resources\Arkzen\QueueFlow;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'queue_id' => $this->queue_id,
            'ticket_number' => $this->ticket_number,
            'customer_name' => $this->customer_name,
            'status' => $this->status,
            'position' => $this->position,
            'called_at' => $this->called_at,
            'served_at' => $this->served_at,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
