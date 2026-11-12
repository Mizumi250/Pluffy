<?php

// ============================================================
// ARKZEN GENERATED MODEL — SendLog
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:44.548410Z
// ============================================================

namespace App\Models\Arkzen\ExpressTest2;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SendLog extends Model
{
    use HasFactory;

    protected $connection = 'express_test_2';

    protected $table = 'express_test_2_send_log';

    protected $fillable = [
        'user_id',
        'channel',
        'target',
        'status'
    ];

    protected $casts = [

    ];


}
