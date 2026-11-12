<?php

// ============================================================
// ARKZEN GENERATED MODEL — Ticket
// Tatemono: express-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:43.129186Z
// ============================================================

namespace App\Models\Arkzen\ExpressTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ticket extends Model
{
    use HasFactory;

    protected $connection = 'express_test';

    protected $table = 'express_test_tickets';

    protected $fillable = [
        'user_id',
        'title',
        'status',
        'priority',
        'done'
    ];

    protected $casts = [
        'priority' => 'integer',
        'done' => 'boolean'
    ];


}
