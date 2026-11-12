<?php

// ============================================================
// ARKZEN GENERATED MODEL — JobResult
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:44.530892Z
// ============================================================

namespace App\Models\Arkzen\ExpressTest2;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobResult extends Model
{
    use HasFactory;

    protected $connection = 'express_test_2';

    protected $table = 'express_test_2_job_results';

    protected $fillable = [
        'job_name',
        'status',
        'result'
    ];

    protected $casts = [

    ];


}
