<?php

// ============================================================
// ARKZEN GENERATED MODEL — Note
// Tatemono: rust-backend-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:04:02.427232Z
// ============================================================

namespace App\Models\Arkzen\RustBackendTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Note extends Model
{
    use HasFactory;

    protected $connection = 'rust_backend_test';

    protected $table = 'rust_backend_test_notes';

    protected $fillable = [
        'title',
        'body'
    ];

    protected $casts = [

    ];


}
