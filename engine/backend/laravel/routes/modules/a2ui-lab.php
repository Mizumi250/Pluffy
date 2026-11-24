<?php

// ============================================================
// ARKZEN GENERATED ROUTES — a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T02:03:28.794296Z
// Resources: Service, RepairTicket, Booking, UnmetRequest
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\A2uiLab\ServiceController;
use App\Http\Controllers\Arkzen\A2uiLab\RepairTicketController;
use App\Http\Controllers\Arkzen\A2uiLab\BookingController;
use App\Http\Controllers\Arkzen\A2uiLab\AssistantController;

// ── Service ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/a2ui-lab')
    ->group(function () {

        // List the workshop services and prices
        Route::get('/services', [ServiceController::class, 'index']);

    });

// ── RepairTicket ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/a2ui-lab')
    ->group(function () {

        // Look up repair tickets, filtered by code
        Route::get('/tickets', [RepairTicketController::class, 'index']);

    });

// ── Booking ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/a2ui-lab')
    ->group(function () {

        // Book a workshop slot
        Route::post('/bookings', [BookingController::class, 'store']);

    });

// ── UnmetRequest ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/a2ui-lab')
    ->group(function () {

        // Pick one registered screen for the visitor's message, or none
        Route::post('/plan', [AssistantController::class, 'plan']);

    });
