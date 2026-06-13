<?php

// ============================================================
// ARKZEN GENERATED EVENT — UserSignedUp
// Tatemono: events-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T00:54:05.721090Z
// ============================================================

namespace App\Events\Arkzen\EventsTest;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserSignedUp
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array $data = []
    ) {}
}
