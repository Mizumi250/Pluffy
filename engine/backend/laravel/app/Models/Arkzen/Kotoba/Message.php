<?php

// ============================================================
// ARKZEN GENERATED MODEL — Message
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:59.504428Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_messages';

    protected $fillable = [
        'conversation_id',
        'circle_id',
        'sender_id',
        'sender_name',
        'sender_color',
        'body',
        'lang',
        'corrected',
        'note',
        'corrected_by'
    ];

    protected $casts = [
        'id' => 'integer',
        'conversation_id' => 'integer',
        'circle_id' => 'integer',
        'sender_id' => 'integer',
        'corrected_by' => 'integer'
    ];


}
