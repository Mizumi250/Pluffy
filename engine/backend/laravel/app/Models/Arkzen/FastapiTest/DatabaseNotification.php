<?php

// ============================================================
// ARKZEN GENERATED DATABASE NOTIFICATION MODEL — fastapi-test
// Isolated to: database/arkzen/fastapi-test.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\FastapiTest;

use Illuminate\Notifications\DatabaseNotification as BaseDatabaseNotification;

class DatabaseNotification extends BaseDatabaseNotification
{
    protected $connection = 'fastapi_test';
    protected $table      = 'fastapi_test_notifications';

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
