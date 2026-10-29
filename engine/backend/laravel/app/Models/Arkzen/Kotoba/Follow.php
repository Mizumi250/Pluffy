<?php

// ============================================================
// ARKZEN GENERATED MODEL — Follow
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:59.489715Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Follow extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_follows';

    protected $fillable = [
        'follower_id',
        'following_id'
    ];

    protected $casts = [
        'id' => 'integer',
        'follower_id' => 'integer',
        'following_id' => 'integer'
    ];


}
