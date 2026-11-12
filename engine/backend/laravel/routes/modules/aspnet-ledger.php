<?php

// ============================================================
// ARKZEN GENERATED ROUTES — aspnet-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:32.665689Z
// Resources: Account
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\AspnetLedger\AccountController;

// ── Account ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/aspnet-ledger')
    ->group(function () {

        // List accounts ordered by id
        Route::get('/accounts', [AccountController::class, 'accounts']);

        // Open an account (standard CRUD store with validation)
        Route::post('/accounts', [AccountController::class, 'open']);

        // Move funds between two accounts in one database transaction
        Route::post('/transfer', [AccountController::class, 'transfer']);

        // Debits the source, then fails on purpose to prove the rollback
        Route::post('/transfer/crash', [AccountController::class, 'crash']);

        // Latest transfers with account owners
        Route::get('/transfers', [AccountController::class, 'transfers']);

        // Total money held and total moved
        Route::get('/summary', [AccountController::class, 'summary']);

    });
