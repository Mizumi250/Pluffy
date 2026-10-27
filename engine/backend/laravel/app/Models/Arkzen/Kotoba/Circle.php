<?php

// ============================================================
// ARKZEN GENERATED MODEL — Circle
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:51.173961Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Circle extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_circles';

    protected $fillable = [
        'name',
        'emoji',
        'lang',
        'level',
        'description',
        'owner_id',
        'members_count',
        'weekly_goal'
    ];

    protected $casts = [
        'id' => 'integer',
        'owner_id' => 'integer',
        'members_count' => 'integer',
        'weekly_goal' => 'integer'
    ];


}
