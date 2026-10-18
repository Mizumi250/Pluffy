<?php

// ============================================================
// ARKZEN GENERATED BROADCAST EVENT — QueueUpdated
// Tatemono: queue-flow
// Channel: queue-flow.{queueId} (public)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:36.929067Z
// ============================================================

namespace App\Events\Arkzen\QueueFlow\Broadcast;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\Channel;

class QueueUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array $data = []
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('queue-flow.{queueId}')];
    }

    public function broadcastAs(): string
    {
        return 'queue-flow.queue-updated';
    }

    public function broadcastWith(): array
    {
        return $this->data;
    }
}
