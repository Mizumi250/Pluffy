<?php

// ============================================================
// ARKZEN GENERATED MODEL — LessonResult
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:38.117432Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LessonResult extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_lesson_results';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'score',
        'best'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'lesson_id' => 'integer',
        'score' => 'integer',
        'best' => 'integer'
    ];


}
