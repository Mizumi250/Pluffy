<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — PhotoResource
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-06T04:12:37.754970Z
// ============================================================

namespace App\Http\Resources\Arkzen\ChurchCommunity;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'event_id' => $this->event_id,
            'uploader_id' => $this->uploader_id,
            'url' => $this->url,
            'thumbnail_url' => $this->thumbnail_url,
            'caption' => $this->caption,
            'file_name' => $this->file_name,
            'file_size' => $this->file_size,
            'tags' => $this->tags,
            'likes_count' => $this->likes_count,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
