<?php

// ============================================================
// ARKZEN GENERATED USER MODEL — roles-test
// Isolated to: database/arkzen/roles-test.sqlite
// Notifications: DISABLED (no @arkzen:notifications declared)
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\RolesTest;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $connection = 'roles_test';

    protected $table = 'roles_test_users';

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
