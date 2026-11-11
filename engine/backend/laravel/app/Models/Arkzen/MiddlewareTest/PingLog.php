<?php

// ============================================================
// ARKZEN GENERATED MODEL — PingLog
// Tatemono: middleware-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T08:35:40.453747Z
// ============================================================

namespace App\Models\Arkzen\MiddlewareTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PingLog extends Model
{
    use HasFactory;

    protected $connection = 'middleware_test';

    protected $table = 'middleware_test_ping_logs';

    protected $fillable = [
        'message',
        'headers_ok'
    ];

    protected $casts = [
        'headers_ok' => 'boolean'
    ];


}
