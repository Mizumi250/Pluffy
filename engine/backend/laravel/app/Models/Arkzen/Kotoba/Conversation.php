<?php

// ============================================================
// ARKZEN GENERATED MODEL — Conversation
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:49.314165Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conversation extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_conversations';

    protected $fillable = [
        'user_a',
        'user_b',
        'last_message',
        'last_at'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_a' => 'integer',
        'user_b' => 'integer',
        'last_at' => 'datetime'
    ];


}
