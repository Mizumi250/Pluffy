<?php

// ============================================================
// ARKZEN GENERATED LISTENER — LogTicket
// Tatemono: fastapi-test
// Listens to: App\Events\Arkzen\FastapiTest\TicketCreated
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:34.778883Z
// ============================================================

namespace App\Listeners\Arkzen\FastapiTest;

use App\Events\Arkzen\FastapiTest\TicketCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use \App\Models\Arkzen\FastapiTest\EventLog;

class LogTicket implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(TicketCreated $event): void
    {
        $start = microtime(true);
        
        \App\Models\Arkzen\FastapiTest\EventLog::create([
            'event_name'    => class_basename($event),
            'listener_name' => class_basename($this),
            'status'        => 'completed',
            'payload'       => json_encode($event->data),
            'duration_ms'   => (int) ((microtime(true) - $start) * 1000),
        ]);
    }
}
