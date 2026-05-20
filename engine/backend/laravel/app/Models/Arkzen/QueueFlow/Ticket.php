<?php

// ============================================================
// ARKZEN GENERATED MODEL — Ticket
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-20T06:38:24.787039Z
// ============================================================

namespace App\Models\Arkzen\QueueFlow;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ticket extends Model
{
    use HasFactory;

    protected $connection = 'queue_flow';

    protected $table = 'queue_flow_tickets';

    protected $fillable = [
        'queue_id',
        'ticket_number',
        'customer_name',
        'status',
        'position',
        'called_at',
        'served_at'
    ];

    protected $casts = [
        'id' => 'integer',
        'position' => 'integer',
        'called_at' => 'datetime',
        'served_at' => 'datetime'
    ];

    public function queue()
    {
        return $this->belongsTo(\App\Models\Arkzen\QueueFlow\QueueFlowQueue::class, 'queue_id');
    }
}
