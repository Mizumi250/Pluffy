<?php

// ============================================================
// ARKZEN GENERATED MODEL — ShikakuSave
// Tatemono: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-26T07:09:02.910249Z
// ============================================================

namespace App\Models\Arkzen\Shikaku;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShikakuSave extends Model
{
    use HasFactory;

    protected $connection = 'shikaku';

    protected $table = 'shikaku_saves';

    protected $fillable = [
        'project_id',
        'frames_json',
        'version'
    ];

    protected $casts = [
        'id' => 'integer',
        'project_id' => 'integer',
        'version' => 'integer'
    ];


}
