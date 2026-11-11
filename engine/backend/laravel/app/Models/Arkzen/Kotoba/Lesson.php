<?php

// ============================================================
// ARKZEN GENERATED MODEL — Lesson
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:49.293565Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_lessons';

    protected $fillable = [
        'lang',
        'unit',
        'title',
        'emoji',
        'level',
        'position',
        'xp',
        'content'
    ];

    protected $casts = [
        'id' => 'integer',
        'position' => 'integer',
        'xp' => 'integer'
    ];


}
