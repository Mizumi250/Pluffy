<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — QueueResource
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-09T09:45:54.454199Z
// ============================================================

namespace App\Http\Resources\Arkzen\QueueFlow;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QueueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'prefix' => $this->prefix,
            'is_active' => $this->is_active,
            'avg_wait_minutes' => $this->avg_wait_minutes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
