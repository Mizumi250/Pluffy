<?php

// ============================================================
// ARKZEN GENERATED ROUTES — rust-backend-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:04.266399Z
// Resources: Note
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\RustBackendTest\NoteController;

// ── Note ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/rust-backend-test/notes')
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
