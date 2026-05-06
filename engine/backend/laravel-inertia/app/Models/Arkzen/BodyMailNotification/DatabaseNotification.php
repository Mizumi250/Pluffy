<?php

// ============================================================
// ARKZEN GENERATED DATABASE NOTIFICATION MODEL — body-mail-notification
// Isolated to: database/arkzen/body-mail-notification.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\BodyMailNotification;

use Illuminate\Notifications\DatabaseNotification as BaseDatabaseNotification;

class DatabaseNotification extends BaseDatabaseNotification
{
    protected $connection = 'body_mail_notification';
    protected $table      = 'body_mail_notification_notifications';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->type)) {
                $model->type = 'notifiable';
            }
        });
    }
}
