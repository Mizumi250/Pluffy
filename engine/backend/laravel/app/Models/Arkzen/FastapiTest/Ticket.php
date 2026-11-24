<?php

// ============================================================
// ARKZEN GENERATED MODEL — Ticket
// Tatemono: fastapi-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T07:19:33.631880Z
// ============================================================

namespace App\Models\Arkzen\FastapiTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ticket extends Model
{
    use HasFactory;

    protected $connection = 'fastapi_test';

    protected $table = 'fastapi_test_tickets';

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
