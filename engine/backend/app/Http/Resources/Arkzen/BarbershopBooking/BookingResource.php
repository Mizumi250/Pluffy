<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — BookingResource
// Tatemono: barbershop-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-28T06:45:57.980988Z
// ============================================================

namespace App\Http\Resources\Arkzen\BarbershopBooking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'barber_id' => $this->barber_id,
            'service_id' => $this->service_id,
            'booking_date' => $this->booking_date,
            'booking_time' => $this->booking_time,
            'client_name' => $this->client_name,
            'client_phone' => $this->client_phone,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
