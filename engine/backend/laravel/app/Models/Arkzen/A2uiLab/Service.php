<?php

// ============================================================
// ARKZEN GENERATED MODEL — Service
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:21.482754Z
// ============================================================

namespace App\Models\Arkzen\A2uiLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model
{
    use HasFactory;

    protected $connection = 'a2ui_lab';

    protected $table = 'a2ui_lab_services';

    protected $fillable = [
        'name',
        'price_idr',
        'minutes',
        'note'
    ];

    protected $casts = [
        'price_idr' => 'integer',
        'minutes' => 'integer'
    ];


}
