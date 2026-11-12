<?php

// ============================================================
// ARKZEN GENERATED MODEL — TestRecord
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:44.516925Z
// ============================================================

namespace App\Models\Arkzen\ExpressTest2;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class TestRecord extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $connection = 'express_test_2';

    protected $table = 'express_test_2_records';

    protected $fillable = [
        'user_id',
        'title',
        'status',
        'priority',
        'done'
    ];

    protected $casts = [
        'priority' => 'integer',
        'done' => 'boolean'
    ];


}
