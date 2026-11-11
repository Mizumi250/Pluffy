<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — TestRecordResource
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.289218Z
// ============================================================

namespace App\Http\Resources\Arkzen\ExpressTest2;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'status' => $this->status,
            'priority' => $this->priority,
            'done' => $this->done,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
