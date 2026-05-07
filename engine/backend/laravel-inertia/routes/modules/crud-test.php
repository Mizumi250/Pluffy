<?php

// ============================================================
// ARKZEN GENERATED ROUTES — crud-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:52:54.164873Z
// Resources: Item
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\CrudTest\ItemController;

// ── Item ─────────────────────────────
Route::middleware(['web'])
    ->prefix('/crud-test')
    ->group(function () {

        // Get all items
        Route::get('/items', [ItemController::class, 'index']);

        // Create item
        Route::post('/items', [ItemController::class, 'store']);

        // Get single item
        Route::get('/items/{item}', [ItemController::class, 'show']);

        // Update item
        Route::put('/items/{item}', [ItemController::class, 'update']);

        // Delete item
        Route::delete('/items/{item}', [ItemController::class, 'destroy']);

    });
