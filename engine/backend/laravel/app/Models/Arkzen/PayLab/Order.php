<?php

// ============================================================
// ARKZEN GENERATED MODEL — Order
// Tatemono: pay-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:58.580774Z
// ============================================================

namespace App\Models\Arkzen\PayLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $connection = 'pay_lab';

    protected $table = 'pay_lab_orders';

    protected $fillable = [
        'public_id',
        'status',
        'total_cents',
        'currency',
        'idempotency_key',
        'fingerprint',
        'provider_session_id',
        'checkout_url'
    ];

    protected $casts = [
        'total_cents' => 'integer'
    ];


}
