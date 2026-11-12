<?php

// ============================================================
// ARKZEN GENERATED MODEL — Account
// Tatemono: spring-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:07.353378Z
// ============================================================

namespace App\Models\Arkzen\SpringLedger;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Account extends Model
{
    use HasFactory;

    protected $connection = 'spring_ledger';

    protected $table = 'spring_ledger_accounts';

    protected $fillable = [
        'name',
        'balance'
    ];

    protected $casts = [
        'id' => 'integer',
        'balance' => 'decimal:2'
    ];

    public function from_accounts()
    {
        return $this->hasMany(\App\Models\Arkzen\SpringLedger\Transfer::class, 'from_account_id');
    }

    public function to_accounts()
    {
        return $this->hasMany(\App\Models\Arkzen\SpringLedger\Transfer::class, 'to_account_id');
    }
}
