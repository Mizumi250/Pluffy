<?php

// ============================================================
// ARKZEN GENERATED MODEL — Note
// Tatemono: spring-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:08.012157Z
// ============================================================

namespace App\Models\Arkzen\SpringTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Note extends Model
{
    use HasFactory;

    protected $connection = 'spring_test';

    protected $table = 'spring_test_notes';

    protected $fillable = [
        'title',
        'body',
        'pinned'
    ];

    protected $casts = [
        'id' => 'integer',
        'pinned' => 'boolean'
    ];


}
