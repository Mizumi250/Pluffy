<?php

// ============================================================
// ARKZEN GENERATED MODEL — Comment
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:49.702255Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Comment extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_comments';

    protected $fillable = [
        'post_id',
        'user_id',
        'author_name',
        'author_color',
        'body',
        'is_correction',
        'corrected',
        'explanation',
        'accepted'
    ];

    protected $casts = [
        'id' => 'integer',
        'post_id' => 'integer',
        'user_id' => 'integer',
        'is_correction' => 'boolean',
        'accepted' => 'boolean'
    ];


}
