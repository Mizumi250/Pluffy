<?php

// ============================================================
// ARKZEN GENERATED MODEL — Product
// Tatemono: pay-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:51.935502Z
// ============================================================

namespace App\Models\Arkzen\PayLab;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $connection = 'pay_lab';

    protected $table = 'pay_lab_products';

    protected $fillable = [
        'slug',
        'name',
        'region',
        'notes',
        'roast',
        'price_cents',
        'accent',
        'ink'
    ];

    protected $casts = [
        'roast' => 'integer',
        'price_cents' => 'integer'
    ];


}
