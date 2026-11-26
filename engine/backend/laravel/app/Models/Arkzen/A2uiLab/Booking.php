<?php

// ============================================================
// ARKZEN GENERATED MODEL — Booking
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:21.517856Z
// ============================================================

namespace App\Models\Arkzen\A2uiLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $connection = 'a2ui_lab';

    protected $table = 'a2ui_lab_bookings';

    protected $fillable = [
        'name',
        'service',
        'day',
        'slot'
    ];

    protected $casts = [

    ];


}
