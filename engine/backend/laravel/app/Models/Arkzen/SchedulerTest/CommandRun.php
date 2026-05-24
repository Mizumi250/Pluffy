<?php

// ============================================================
// ARKZEN GENERATED MODEL — CommandRun
// Tatemono: scheduler-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-24T01:36:37.877108Z
// ============================================================

namespace App\Models\Arkzen\SchedulerTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommandRun extends Model
{
    use HasFactory;

    protected $connection = 'scheduler_test';

    protected $table = 'scheduler_test_command_runs';

    protected $fillable = [
        'command_name',
        'signature',
        'exit_code',
        'output',
        'triggered_by',
        'duration_ms'
    ];

    protected $casts = [
        'id' => 'integer',
        'exit_code' => 'integer',
        'duration_ms' => 'integer'
    ];


}
