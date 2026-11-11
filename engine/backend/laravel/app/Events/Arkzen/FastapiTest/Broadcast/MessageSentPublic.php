<?php

// ============================================================
// ARKZEN GENERATED BROADCAST EVENT — MessageSentPublic
// Tatemono: fastapi-test
// Channel: fastapi-test-public (public)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:34.854758Z
// ============================================================

namespace App\Events\Arkzen\FastapiTest\Broadcast;

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
        return [new Channel('fastapi-test-public')];
    }

    public function broadcastAs(): string
    {
        return 'fastapi-test.message-sent-public';
    }

    public function broadcastWith(): array
    {
        return $this->data;
    }
}
