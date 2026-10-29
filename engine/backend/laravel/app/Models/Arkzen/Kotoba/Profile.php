<?php

// ============================================================
// ARKZEN GENERATED MODEL — Profile
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:59.480282Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profile extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_profiles';

    protected $fillable = [
        'user_id',
        'display_name',
        'bio',
        'native_lang',
        'learning_lang',
        'level',
        'country',
        'interests',
        'avatar_color',
        'xp',
        'streak',
        'best_streak',
        'last_active',
        'daily_goal',
        'words_written',
        'messages_sent',
        'onboarded'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'xp' => 'integer',
        'streak' => 'integer',
        'best_streak' => 'integer',
        'last_active' => 'date',
        'daily_goal' => 'integer',
        'words_written' => 'integer',
        'messages_sent' => 'integer',
        'onboarded' => 'boolean'
    ];


}
