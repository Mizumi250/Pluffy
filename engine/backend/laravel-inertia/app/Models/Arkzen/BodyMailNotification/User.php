<?php

// ============================================================
// ARKZEN GENERATED USER MODEL — body-mail-notification
// Isolated to: database/arkzen/body-mail-notification.sqlite
// Notifications: ENABLED (Notifiable trait + relations)
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\BodyMailNotification;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Models\Arkzen\BodyMailNotification\DatabaseNotification;

Relation::morphMap([
    'notifiable' => DatabaseNotification::class,
]);

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $connection = 'body_mail_notification';

    protected $table = 'body_mail_notification_users';

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
