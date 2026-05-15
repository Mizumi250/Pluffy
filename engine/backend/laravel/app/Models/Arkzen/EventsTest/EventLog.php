<?php

// ============================================================
// ARKZEN GENERATED MODEL — EventLog
// Tatemono: events-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-15T04:19:46.038279Z
// ============================================================

namespace App\Models\Arkzen\EventsTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EventLog extends Model
{
    use HasFactory;

    protected $connection = 'events_test';

    protected $table = 'events_test_event_log';

    protected $fillable = [
        'event_name',
        'listener_name',
        'status',
        'payload',
        'duration_ms'
    ];

    protected $casts = [
        'id' => 'integer',
        'duration_ms' => 'integer'
    ];


}
