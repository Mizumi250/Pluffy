<?php

// ============================================================
// ARKZEN GENERATED MODEL — ShikakuProject
// Tatemono: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-26T07:09:02.905388Z
// ============================================================

namespace App\Models\Arkzen\Shikaku;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShikakuProject extends Model
{
    use HasFactory;

    protected $connection = 'shikaku';

    protected $table = 'shikaku_projects';

    protected $fillable = [
        'user_id',
        'name',
        'width',
        'height',
        'thumbnail'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'width' => 'integer',
        'height' => 'integer'
    ];


}
