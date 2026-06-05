<?php

// ============================================================
// ARKZEN GENERATED MODEL — Member
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-05T13:13:32.524487Z
// ============================================================

namespace App\Models\Arkzen\ChurchCommunity;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Member extends Model
{
    use HasFactory;

    protected $connection = 'church_community';

    protected $table = 'church_community_members';

    protected $fillable = [
        'name',
        'role',
        'photo_url',
        'email',
        'bio',
        'joined_at',
        'is_active'
    ];

    protected $casts = [
        'id' => 'integer',
        'joined_at' => 'date',
        'is_active' => 'boolean'
    ];


}
