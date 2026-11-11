<?php

// ============================================================
// ARKZEN GENERATED USER MODEL — express-test
// Isolated to: database/arkzen/express-test.sqlite
// Notifications: ENABLED (Notifiable trait + relations)
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\ExpressTest;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Models\Arkzen\ExpressTest\DatabaseNotification;

Relation::morphMap([
    'notifiable' => DatabaseNotification::class,
]);

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $connection = 'express_test';

    protected $table = 'express_test_users';

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

    public function notifications()
    {
        return $this->morphMany(DatabaseNotification::class, 'notifiable')
            ->orderBy('created_at', 'desc');
    }

    public function unreadNotifications()
    {
        return $this->notifications()->whereNull('read_at');
    }
}
