<?php

// ============================================================
// ARKZEN GENERATED MODEL — RepairTicket
// Tatemono: webmcp-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:49:01.438396Z
// ============================================================

namespace App\Models\Arkzen\WebmcpLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepairTicket extends Model
{
    use HasFactory;

    protected $connection = 'webmcp_lab';

    protected $table = 'webmcp_lab_repair_tickets';

    protected $fillable = [
        'code',
        'customer',
        'bike',
        'status',
        'note',
        'ready_by'
    ];

    protected $casts = [

    ];


}
