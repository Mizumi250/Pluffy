<?php

// ============================================================
// ARKZEN GENERATED BROADCAST EVENT — MessageCreated
// Tatemono: kotoba
// Channel: kotoba.{id} (private)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:55.344327Z
// ============================================================

namespace App\Events\Arkzen\Kotoba\Broadcast;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;

class MessageCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ?int $userId = null,
        public readonly array $data = []
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('kotoba.' . $this->userId)];
    }

    public function broadcastAs(): string
    {
        return 'kotoba.message-created';
    }

    public function broadcastWith(): array
    {
        return $this->data;
    }
}
