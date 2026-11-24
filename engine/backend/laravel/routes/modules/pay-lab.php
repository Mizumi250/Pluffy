<?php

// ============================================================
// ARKZEN GENERATED ROUTES — pay-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:04:10.179812Z
// Resources: Product, Order
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\PayLab\ProductController;
use App\Http\Controllers\Arkzen\PayLab\OrderController;

// ── Product ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/pay-lab')
    ->group(function () {

        // List the coffees for sale
        Route::get('/products', [ProductController::class, 'index']);

    });

// ── Order ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/pay-lab')
    ->group(function () {

        // Create an order from slugs and quantities, work out the price on the server and open the provider's hosted payment page
        Route::post('/checkout', [OrderController::class, 'checkout']);

        // Read the state of one order by its unguessable reference
        Route::get('/status', [OrderController::class, 'status']);

        // Receive signed payment events from the provider
        Route::post('/webhook', [OrderController::class, 'webhook']);

    });
