<?php

// ============================================================
// ARKZEN GENERATED MODEL — Item
// Tatemono: crud-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-06T18:28:10.066753Z
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
