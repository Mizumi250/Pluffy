<?php

// ============================================================
// ARKZEN GENERATED LISTENER — LogTicket
// Tatemono: express-test
// Listens to: App\Events\Arkzen\ExpressTest\TicketCreated
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:27.334945Z
// ============================================================

namespace App\Listeners\Arkzen\ExpressTest;

use App\Events\Arkzen\ExpressTest\TicketCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use \App\Models\Arkzen\ExpressTest\EventLog;

class LogTicket implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(TicketCreated $event): void
    {
        $start = microtime(true);
        
        \App\Models\Arkzen\ExpressTest\EventLog::create([
            'event_name'    => class_basename($event),
            'listener_name' => class_basename($this),
            'status'        => 'completed',
            'payload'       => json_encode($event->data),
            'duration_ms'   => (int) ((microtime(true) - $start) * 1000),
        ]);
    }
}
