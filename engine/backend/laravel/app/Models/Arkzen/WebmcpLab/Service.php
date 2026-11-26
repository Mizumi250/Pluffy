<?php

// ============================================================
// ARKZEN GENERATED MODEL — Service
// Tatemono: webmcp-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:49:01.436135Z
// ============================================================

namespace App\Models\Arkzen\WebmcpLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model
{
    use HasFactory;

    protected $connection = 'webmcp_lab';

    protected $table = 'webmcp_lab_services';

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
