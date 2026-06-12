<?php

// ============================================================
// ARKZEN GENERATED MODEL — Queue
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T08:48:13.753887Z
// ============================================================

namespace App\Models\Arkzen\QueueFlow;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Queue extends Model
{
    use HasFactory;

    protected $connection = 'queue_flow';

    protected $table = 'queue_flow_queues';

    protected $fillable = [
        'name',
        'description',
        'prefix',
        'is_active',
        'avg_wait_minutes'
    ];

    protected $casts = [
        'id' => 'integer',
        'is_active' => 'boolean',
        'avg_wait_minutes' => 'integer'
    ];


}
