<?php

// ============================================================
// ARKZEN GENERATED BROADCAST EVENT — MessageSentPublic
// Tatemono: express-test
// Channel: express-test-public (public)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:43.498280Z
// ============================================================

namespace App\Events\Arkzen\ExpressTest\Broadcast;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\Channel;

class MessageSentPublic implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array $data = []
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('express-test-public')];
    }

    public function broadcastAs(): string
    {
        return 'express-test.message-sent-public';
    }

    public function broadcastWith(): array
    {
        return $this->data;
    }
}
