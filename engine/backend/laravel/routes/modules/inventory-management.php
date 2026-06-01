<?php

// ============================================================
// ARKZEN GENERATED ROUTES — inventory-management
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-01T05:05:54.541414Z
// Resources: Inventory
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\InventoryManagement\InventoryController;

// ── Inventory ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/inventories')
    ->group(function () {

        // Get paginated list of inventories
        Route::get('/', [InventoryController::class, 'index']);

        // Get single inventory item
        Route::get('/{inventory}', [InventoryController::class, 'show']);

        // Create new inventory item
        Route::post('/', [InventoryController::class, 'store']);

        // Update inventory item
        Route::put('/{inventory}', [InventoryController::class, 'update']);

        // Delete inventory item
        Route::delete('/{inventory}', [InventoryController::class, 'destroy']);

    });
