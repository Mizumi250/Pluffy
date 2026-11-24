<?php

// ============================================================
// ARKZEN GENERATED ROUTES — spring-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T12:30:37.487944Z
// Resources: Note
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\SpringTest\NoteController;

// ── Note ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/spring-test/notes')
    ->group(function () {

        // index
        Route::get('/', [NoteController::class, 'index']);

        // store
        Route::post('/', [NoteController::class, 'store']);

        // show
        Route::get('/{note}', [NoteController::class, 'show']);

        // update
        Route::put('/{note}', [NoteController::class, 'update']);

        // destroy
        Route::delete('/{note}', [NoteController::class, 'destroy']);

    });
