<?php

// ============================================================
// ARKZEN GENERATED MODEL — Item
// Tatemono: crud-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-20T04:25:07.593344Z
// ============================================================

namespace App\Models\Arkzen\CrudTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Item extends Model
{
    use HasFactory;

    protected $connection = 'crud_test';

    protected $table = 'crud_test_items';

    protected $fillable = [
        'name',
        'description',
        'status',
        'priority',
        'tags'
    ];

    protected $casts = [
        'id' => 'integer',
        'priority' => 'integer'
    ];


}
