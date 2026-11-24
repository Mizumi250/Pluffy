<?php

// ============================================================
// ARKZEN GENERATED MODEL — RepairTicket
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T11:53:24.667218Z
// ============================================================

namespace App\Models\Arkzen\A2uiLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepairTicket extends Model
{
    use HasFactory;

    protected $connection = 'a2ui_lab';

    protected $table = 'a2ui_lab_repair_tickets';

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
