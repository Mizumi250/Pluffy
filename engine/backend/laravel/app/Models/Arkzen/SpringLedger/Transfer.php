<?php

// ============================================================
// ARKZEN GENERATED MODEL — Transfer
// Tatemono: spring-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:27:04.918786Z
// ============================================================

namespace App\Models\Arkzen\SpringLedger;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transfer extends Model
{
    use HasFactory;

    protected $connection = 'spring_ledger';

    protected $table = 'spring_ledger_transfers';

    protected $fillable = [
        'from_account_id',
        'to_account_id',
        'amount',
        'status'
    ];

    protected $casts = [
        'id' => 'integer',
        'amount' => 'decimal:2'
    ];

    public function from_account()
    {
        return $this->belongsTo(\App\Models\Arkzen\SpringLedger\Account::class, 'from_account_id');
    }

    public function to_account()
    {
        return $this->belongsTo(\App\Models\Arkzen\SpringLedger\Account::class, 'to_account_id');
    }
}
