<?php

// ============================================================
// ARKZEN GENERATED MODEL — Note
// Tatemono: go-backend-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:47.304899Z
// ============================================================

namespace App\Models\Arkzen\GoBackendTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Note extends Model
{
    use HasFactory;

    protected $connection = 'go_backend_test';

    protected $table = 'go_backend_test_notes';

    protected $fillable = [
        'title',
        'body'
    ];

    protected $casts = [

    ];


}
