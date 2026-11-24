<?php

// ============================================================
// ARKZEN GENERATED MODEL — UnmetRequest
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T07:19:16.556124Z
// ============================================================

namespace App\Models\Arkzen\A2uiLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UnmetRequest extends Model
{
    use HasFactory;

    protected $connection = 'a2ui_lab';

    protected $table = 'a2ui_lab_unmet_requests';

    protected $fillable = [
        'message',
        'source'
    ];

    protected $casts = [

    ];


}
