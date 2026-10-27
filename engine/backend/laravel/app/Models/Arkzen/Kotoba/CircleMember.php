<?php

// ============================================================
// ARKZEN GENERATED MODEL — CircleMember
// Tatemono: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:51.437406Z
// ============================================================

namespace App\Models\Arkzen\Kotoba;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CircleMember extends Model
{
    use HasFactory;

    protected $connection = 'kotoba';

    protected $table = 'kotoba_circle_members';

    protected $fillable = [
        'circle_id',
        'user_id'
    ];

    protected $casts = [
        'id' => 'integer',
        'circle_id' => 'integer',
        'user_id' => 'integer'
    ];


}
