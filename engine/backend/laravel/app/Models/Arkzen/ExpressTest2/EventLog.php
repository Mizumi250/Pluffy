<?php

// ============================================================
// ARKZEN GENERATED MODEL — EventLog
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.010031Z
// ============================================================

namespace App\Models\Arkzen\ExpressTest2;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EventLog extends Model
{
    use HasFactory;

    protected $connection = 'express_test_2';

    protected $table = 'express_test_2_event_log';

    protected $fillable = [
        'event_name',
        'listener',
        'payload'
    ];

    protected $casts = [

    ];


}
