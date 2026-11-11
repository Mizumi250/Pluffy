<?php

// ============================================================
// ARKZEN GENERATED DATABASE NOTIFICATION MODEL — express-test-2
// Isolated to: database/arkzen/express-test-2.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\ExpressTest2;

use Illuminate\Notifications\DatabaseNotification as BaseDatabaseNotification;

class DatabaseNotification extends BaseDatabaseNotification
{
    protected $connection = 'express_test_2';
    protected $table      = 'express_test_2_notifications';

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
