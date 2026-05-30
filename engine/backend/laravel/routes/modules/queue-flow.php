<?php

// ============================================================
// ARKZEN GENERATED ROUTES — queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T00:49:42.734349Z
// Resources: Queue, Ticket
// Custom controllers: QueueController
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\QueueFlow\QueueController;
use App\Http\Controllers\Arkzen\QueueFlow\TicketController;

// ── Queue ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/queue-flow')
    ->group(function () {

        // Get all queues
        Route::get('/queues', [QueueController::class, 'index']);

        // Get a single queue
        Route::get('/queues/{queue}', [QueueController::class, 'show']);

        // Create a new queue
        Route::post('/queues', [QueueController::class, 'store']);

        // Update a queue
        Route::put('/queues/{queue}', [QueueController::class, 'update']);

        // Delete a queue
        Route::delete('/queues/{queue}', [QueueController::class, 'destroy']);

    });

// ── Ticket ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/queue-flow')
    ->group(function () {

        // Get all tickets
        Route::get('/tickets', [TicketController::class, 'index']);

        // Create a new ticket
        Route::post('/tickets', [TicketController::class, 'store']);

        // Update ticket status
        Route::put('/tickets/{ticket}', [TicketController::class, 'update']);

    });

// ── Custom: QueueController ─────────────────────────────
Route::middleware(['api'])
    ->group(function () {
        Route::post('api/queue-flow/join', [QueueController::class, 'join_queue']);
        Route::post('api/queue-flow/call-next', [QueueController::class, 'call_next']);
        Route::get('api/queue-flow/status/{queue_id}', [QueueController::class, 'queue_status']);
        Route::get('api/queue-flow/my-ticket/{queue_id}/{ticket_number}', [QueueController::class, 'my_ticket']);
    });
