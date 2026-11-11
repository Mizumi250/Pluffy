<?php

// ============================================================
// ARKZEN GENERATED BROADCAST EVENT — RecordCreated
// Tatemono: express-test-2
// Channel: express-test-2-public (public)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:32.020102Z
// ============================================================

namespace App\Events\Arkzen\ExpressTest2\Broadcast;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\Channel;

class RecordCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array $data = []
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('express-test-2-public')];
    }

    public function broadcastAs(): string
    {
        return 'express-test-2.record-created';
    }

    public function broadcastWith(): array
    {
        return $this->data;
    }
}
