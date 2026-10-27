<?php

// ============================================================
// ARKZEN GENERATED MODEL — Alert
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:51.444636Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Alert extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_alerts';

    protected $fillable = [
        'user_id',
        'kind',
        'text',
        'ref',
        'is_read'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'ref' => 'integer',
        'is_read' => 'boolean'
    ];


}
