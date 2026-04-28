<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — BarberResource
// Tatemono: barbershop-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-28T06:45:57.979587Z
// ============================================================

namespace App\Http\Resources\Arkzen\BarbershopBooking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name' => $this->name,
            'specialty' => $this->specialty,
            'rating' => $this->rating,
            'reviews' => $this->reviews,
            'avatar_initials' => $this->avatar_initials,
            'avatar_color' => $this->avatar_color,
            'available' => $this->available,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
