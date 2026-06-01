<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — EventResource
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-01T05:05:53.256811Z
// ============================================================

namespace App\Http\Resources\Arkzen\ChurchCommunity;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'event_date' => $this->event_date,
            'cover_photo_url' => $this->cover_photo_url,
            'is_members_only' => $this->is_members_only,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
