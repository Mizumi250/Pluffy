<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — MemberResource
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-08T15:11:44.423806Z
// ============================================================

namespace App\Http\Resources\Arkzen\ChurchCommunity;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name' => $this->name,
            'role' => $this->role,
            'photo_url' => $this->photo_url,
            'email' => $this->email,
            'bio' => $this->bio,
            'joined_at' => $this->joined_at,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
