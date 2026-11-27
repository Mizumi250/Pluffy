<?php

// ============================================================
// ARKZEN GENERATED MODEL — Task
// Tatemono: go-concurrency-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T06:51:31.062302Z
// ============================================================

namespace App\Models\Arkzen\GoConcurrencyLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    protected $connection = 'go_concurrency_lab';

    protected $table = 'go_concurrency_lab_tasks';

    protected $fillable = [
        'title',
        'priority',
        'status'
    ];

    protected $casts = [
        'priority' => 'integer'
    ];


}
