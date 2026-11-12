<?php

// ============================================================
// ARKZEN GENERATED ROUTES — spring-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:07.380126Z
// Resources: Account, Transfer
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\SpringLedger\AccountController;
use App\Http\Controllers\Arkzen\SpringLedger\TransferController;

// ── Account ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/spring-ledger/accounts')
    ->group(function () {

        // index
        Route::get('/', [AccountController::class, 'index']);

        // transfer
        Route::post('/transfer', [AccountController::class, 'transfer']);

    });

// ── Transfer ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/spring-ledger/transfers')
    ->group(function () {

        // index
        Route::get('/', [TransferController::class, 'index']);

    });
