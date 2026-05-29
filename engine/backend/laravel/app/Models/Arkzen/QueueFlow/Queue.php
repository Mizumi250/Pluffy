<?php

// ============================================================
// ARKZEN GENERATED MODEL — Queue
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-29T06:47:02.545694Z
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
