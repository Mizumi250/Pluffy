<?php

// ============================================================
// ARKZEN GENERATED MODEL — Like
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:59.487446Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Like extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_likes';

    protected $fillable = [
        'post_id',
        'user_id'
    ];

    protected $casts = [
        'id' => 'integer',
        'post_id' => 'integer',
        'user_id' => 'integer'
    ];


}
