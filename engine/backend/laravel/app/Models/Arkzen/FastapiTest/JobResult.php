<?php

// ============================================================
// ARKZEN GENERATED MODEL — JobResult
// Tatemono: fastapi-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:33.447575Z
// ============================================================

namespace App\Models\Arkzen\FastapiTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobResult extends Model
{
    use HasFactory;

    protected $connection = 'fastapi_test';

    protected $table = 'fastapi_test_job_results';

    protected $fillable = [
        'job_name',
        'status'
    ];

    protected $casts = [

    ];


}
