<?php

// ============================================================
// ARKZEN GENERATED EVENT — TicketCreated
// Tatemono: express-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:43.488912Z
// ============================================================

namespace App\Events\Arkzen\ExpressTest;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly array $data = []
    ) {}
}
