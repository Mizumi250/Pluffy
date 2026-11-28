<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — BookingController
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:53:35.981887Z
// ============================================================

namespace App\Http\Controllers\Arkzen\A2uiLab;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\A2uiLab\Booking;
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
