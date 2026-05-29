<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — TimeRecordResource
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-29T11:51:24.360283Z
// ============================================================

namespace App\Http\Resources\Arkzen\DtrGeofencing;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimeRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'employee_id' => $this->employee_id,
            'type' => $this->type,
            'timestamp' => $this->timestamp,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'within_geofence' => $this->within_geofence,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
