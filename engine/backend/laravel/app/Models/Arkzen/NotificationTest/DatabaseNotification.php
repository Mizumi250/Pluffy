<?php

// ============================================================
// ARKZEN GENERATED DATABASE NOTIFICATION MODEL — notification-test
// Isolated to: database/arkzen/notification-test.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\NotificationTest;

use Illuminate\Notifications\DatabaseNotification as BaseDatabaseNotification;

class DatabaseNotification extends BaseDatabaseNotification
{
    protected $connection = 'notification_test';
    protected $table      = 'notification_test_notifications';

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
