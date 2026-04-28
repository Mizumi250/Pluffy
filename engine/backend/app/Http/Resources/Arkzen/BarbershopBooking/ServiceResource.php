<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — ServiceResource
// Tatemono: barbershop-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-28T06:45:57.980165Z
// ============================================================

namespace App\Http\Resources\Arkzen\BarbershopBooking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name' => $this->name,
            'duration' => $this->duration,
            'price' => $this->price,
            'description' => $this->description,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
