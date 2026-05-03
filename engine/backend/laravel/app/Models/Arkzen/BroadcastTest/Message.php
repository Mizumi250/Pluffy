<?php

// ============================================================
// ARKZEN GENERATED MODEL — Message
// Tatemono: broadcast-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-03T14:35:49.932202Z
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
