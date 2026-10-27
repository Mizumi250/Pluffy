<?php

// ============================================================
// ARKZEN GENERATED MODEL — Post
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:49.322246Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Post extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_posts';

    protected $fillable = [
        'user_id',
        'author_name',
        'author_color',
        'author_native',
        'lang',
        'kind',
        'mission_id',
        'body',
        'translation',
        'likes_count',
        'comments_count',
        'corrections_count'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'mission_id' => 'integer',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'corrections_count' => 'integer'
    ];


}
