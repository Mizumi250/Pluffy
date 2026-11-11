<?php

// ============================================================
// ARKZEN GENERATED DATABASE NOTIFICATION MODEL — express-test
// Isolated to: database/arkzen/express-test.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\ExpressTest;

use Illuminate\Notifications\DatabaseNotification as BaseDatabaseNotification;

class DatabaseNotification extends BaseDatabaseNotification
{
    protected $connection = 'express_test';
    protected $table      = 'express_test_notifications';

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
