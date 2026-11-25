<?php

// ============================================================
// ARKZEN GENERATED MODEL — Booking
// Tatemono: webmcp-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-25T01:29:43.995725Z
// ============================================================

namespace App\Models\Arkzen\WebmcpLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $connection = 'webmcp_lab';

    protected $table = 'webmcp_lab_bookings';

    protected $fillable = [
        'name',
        'service',
        'day',
        'slot'
    ];

    protected $casts = [

    ];


}
