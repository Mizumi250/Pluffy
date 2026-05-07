<?php

// ============================================================
// ARKZEN GENERATED MODEL — Message
// Tatemono: broadcast-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T11:41:47.300568Z
// ============================================================

namespace App\Models\Arkzen\BroadcastTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;

    protected $connection = 'broadcast_test';

    protected $table = 'broadcast_test_messages';

    protected $fillable = [
        'content',
        'channel_type'
    ];

    protected $casts = [
        'id' => 'integer'
    ];


}
