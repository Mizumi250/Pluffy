<?php

// ============================================================
// ARKZEN GENERATED MODEL — Inventory
// Tatemono: inventory-management
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T11:18:02.747454Z
// ============================================================

namespace App\Models\Arkzen\InventoryManagement;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Inventory extends Model
{
    use HasFactory;

    protected $connection = 'inventory_management';

    protected $table = 'inventory_management_inventories';

    protected $fillable = [
        'name',
        'sku',
        'quantity',
        'price',
        'category',
        'description'
    ];

    protected $casts = [
        'id' => 'integer',
        'quantity' => 'integer',
        'price' => 'decimal:2'
    ];


}
