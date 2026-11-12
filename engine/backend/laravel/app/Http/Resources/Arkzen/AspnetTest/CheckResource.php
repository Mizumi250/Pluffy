<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — CheckResource
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:33.571079Z
// ============================================================

namespace App\Http\Resources\Arkzen\AspnetTest;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CheckResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'status' => $this->status,
            'priority' => $this->priority,
            'done' => $this->done,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
