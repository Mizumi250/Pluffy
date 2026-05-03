<?php

// ============================================================
// ARKZEN GENERATED EVENT — QueueUpdated
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-03T04:47:00.646916Z
// ============================================================

namespace App\Events\Arkzen\QueueFlow;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QueueUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array $data = []
    ) {}
}
