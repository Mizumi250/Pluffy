<?php

// ============================================================
// ARKZEN GENERATED MODEL — CommandRun
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:03:47.154636Z
// ============================================================

namespace App\Models\Arkzen\ExpressTest2;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommandRun extends Model
{
    use HasFactory;

    protected $connection = 'express_test_2';

    protected $table = 'express_test_2_command_runs';

    protected $fillable = [
        'command_name',
        'signature',
        'exit_code',
        'output',
        'triggered_by',
        'duration_ms'
    ];

    protected $casts = [
        'exit_code' => 'integer',
        'duration_ms' => 'integer'
    ];


}
