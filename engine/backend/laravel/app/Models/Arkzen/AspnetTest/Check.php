<?php

// ============================================================
// ARKZEN GENERATED MODEL — Check
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:31.082700Z
// ============================================================

namespace App\Models\Arkzen\AspnetTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Check extends Model
{
    use HasFactory;

    protected $connection = 'aspnet_test';

    protected $table = 'aspnet_test_checks';

    protected $fillable = [
        'user_id',
        'name',
        'status',
        'priority',
        'done'
    ];

    protected $casts = [
        'id' => 'integer',
        'priority' => 'integer',
        'done' => 'boolean'
    ];


}
