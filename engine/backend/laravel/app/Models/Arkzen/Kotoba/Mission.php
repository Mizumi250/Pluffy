<?php

// ============================================================
// ARKZEN GENERATED MODEL — Mission
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:49.288799Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Mission extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_missions';

    protected $fillable = [
        'lang',
        'level',
        'title',
        'prompt',
        'hint',
        'position'
    ];

    protected $casts = [
        'id' => 'integer',
        'position' => 'integer'
    ];


}
