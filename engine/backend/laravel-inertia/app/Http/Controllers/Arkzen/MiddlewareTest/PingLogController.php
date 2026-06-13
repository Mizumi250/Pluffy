<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — PingLogController
// Tatemono: middleware-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T07:49:34.257777Z
// ============================================================

namespace App\Http\Controllers\Arkzen\MiddlewareTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\MiddlewareTest\PingLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PingLogController extends Controller
{
    /**
     * Returns all ping logs — passes through requireJson middleware
     */
    public function index(Request $request): JsonResponse
    {
        $query = PingLog::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Create a ping log entry — blocked by requireJson if Content-Type is wrong
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:255',
            'headers_ok' => 'sometimes|boolean'
        ]);

        $pingLog = PingLog::create($validated);

        return response()->json($pingLog, 201);
    }
}
