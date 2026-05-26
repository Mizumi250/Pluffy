<?php

// ============================================================
// ARKZEN GENERATED MODEL — JobResult
// Tatemono: job-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-26T09:29:49.565334Z
// ============================================================

namespace App\Models\Arkzen\JobTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobResult extends Model
{
    use HasFactory;

    protected $connection = 'job_test';

    protected $table = 'job_test_job_results';

    protected $fillable = [
        'job_name',
        'status',
        'result',
        'processed_at'
    ];

    protected $casts = [
        'id' => 'integer',
        'processed_at' => 'datetime'
    ];


}
