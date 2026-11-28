<?php

// ============================================================
// ARKZEN GENERATED ROUTES — webmcp-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:54:12.894666Z
// Resources: Service, RepairTicket, Booking
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\WebmcpLab\ServiceController;
use App\Http\Controllers\Arkzen\WebmcpLab\RepairTicketController;
use App\Http\Controllers\Arkzen\WebmcpLab\BookingController;

// ── Service ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/webmcp-lab')
    ->group(function () {

        // List the workshop services and prices
        Route::get('/services', [ServiceController::class, 'index']);

    });

// ── RepairTicket ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/webmcp-lab')
    ->group(function () {

        // Look up repair tickets, filtered by code
        Route::get('/tickets', [RepairTicketController::class, 'index']);

    });

// ── Booking ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/webmcp-lab')
    ->group(function () {

        // Book a workshop slot
        Route::post('/bookings', [BookingController::class, 'store']);

    });
