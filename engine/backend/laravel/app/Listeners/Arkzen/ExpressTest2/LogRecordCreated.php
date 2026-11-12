<?php

// ============================================================
// ARKZEN GENERATED LISTENER — LogRecordCreated
// Tatemono: express-test-2
// Listens to: App\Events\Arkzen\ExpressTest2\RecordCreated
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:45.284743Z
// ============================================================

namespace App\Listeners\Arkzen\ExpressTest2;

use App\Events\Arkzen\ExpressTest2\RecordCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use \App\Models\Arkzen\ExpressTest2\EventLog;

class LogRecordCreated implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(RecordCreated $event): void
    {
        $start = microtime(true);
        
        \App\Models\Arkzen\ExpressTest2\EventLog::create([
            'event_name'    => class_basename($event),
            'listener_name' => class_basename($this),
            'status'        => 'completed',
            'payload'       => json_encode($event->data),
            'duration_ms'   => (int) ((microtime(true) - $start) * 1000),
        ]);
    }
}
