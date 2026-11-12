<?php

// ============================================================
// ARKZEN GENERATED MODEL — JobResult
// Tatemono: express-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:43.132839Z
// ============================================================

namespace App\Models\Arkzen\ExpressTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobResult extends Model
{
    use HasFactory;

    protected $connection = 'express_test';

    protected $table = 'express_test_job_results';

    protected $fillable = [
        'job_name',
        'status'
    ];

    protected $casts = [

    ];


}
