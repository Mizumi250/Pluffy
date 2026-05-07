<?php

// ============================================================
// ARKZEN GENERATED USER MODEL — church-community
// Isolated to: database/arkzen/church-community.sqlite
// Notifications: DISABLED (no @arkzen:notifications declared)
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\ChurchCommunity;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $connection = 'church_community';

    protected $table = 'church_community_users';

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    public function tokens()
    {
        return $this->morphMany(PersonalAccessToken::class, 'tokenable');
    }
}
