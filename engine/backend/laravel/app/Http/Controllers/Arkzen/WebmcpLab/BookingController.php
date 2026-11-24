<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — BookingController
// Tatemono: webmcp-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T12:30:40.206336Z
// ============================================================

namespace App\Http\Controllers\Arkzen\WebmcpLab;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\WebmcpLab\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BookingController extends Controller
{
    /**
     * Book a workshop slot
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:80',
            'service' => 'required|string|max:80',
            'day' => 'required|string|max:10',
            'slot' => 'required|string|max:5'
        ]);

        $booking = Booking::create($validated);

        return response()->json($booking, 201);
    }
}
