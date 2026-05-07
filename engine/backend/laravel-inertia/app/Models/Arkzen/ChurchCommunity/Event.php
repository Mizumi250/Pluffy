<?php

// ============================================================
// ARKZEN GENERATED MODEL — Event
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T23:55:09.726878Z
// ============================================================

namespace App\Models\Arkzen\ChurchCommunity;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $connection = 'church_community';

    protected $table = 'church_community_events';

    protected $fillable = [
        'title',
        'description',
        'event_date',
        'cover_photo_url',
        'is_members_only'
    ];

    protected $casts = [
        'id' => 'integer',
        'event_date' => 'date',
        'is_members_only' => 'boolean'
    ];


}
