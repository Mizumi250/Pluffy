<?php

// ============================================================
// ARKZEN GENERATED MODEL — Note
// Tatemono: go-backend-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:37.688884Z
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
