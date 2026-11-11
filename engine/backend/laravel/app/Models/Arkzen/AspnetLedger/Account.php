<?php

// ============================================================
// ARKZEN GENERATED MODEL — Account
// Tatemono: aspnet-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:28.625000Z
// ============================================================

namespace App\Models\Arkzen\AspnetLedger;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Account extends Model
{
    use HasFactory;

    protected $connection = 'aspnet_ledger';

    protected $table = 'aspnet_ledger_accounts';

    protected $fillable = [
        'owner',
        'balance'
    ];

    protected $casts = [
        'id' => 'integer',
        'balance' => 'decimal:2'
    ];


}
