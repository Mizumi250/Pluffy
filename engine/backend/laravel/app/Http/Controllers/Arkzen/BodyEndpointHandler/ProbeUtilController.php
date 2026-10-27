<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ProbeUtilController
// Tatemono: body-endpoint-handler
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-10-27T08:12:16.989645Z
// ============================================================

namespace App\Http\Controllers\Arkzen\BodyEndpointHandler;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ProbeUtilController extends Controller
{
    /**
     * GET /api/body-endpoint-handler/ping
     */
    public function ping(Request $request, mixed ...$params): JsonResponse
    {

        return response()->json([
            'injected'   => true,
            'builder'    => 'CustomRouteBuilder v2.0',
            'handler'    => 'ping',
            'status'     => 'ok',
            'timestamp'  => now()->toIso8601String(),
            'message'    => 'CustomRouteBuilder handler body injection confirmed ✓',
        ]);
    }

    /**
     * POST /api/body-endpoint-handler/record-handler
     */
    public function recordHandler(Request $request, mixed ...$params): JsonResponse
    {

        $validated = $request->validate([
            'probe'   => 'required|string|max:100',
            'payload' => 'nullable|string',
            'ok'      => 'sometimes|boolean',
        ]);
        $record = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::create([
            'source'  => 'handler-body',
            'probe'   => $validated['probe'],
            'payload' => $validated['payload'] ?? null,
            'result'  => 'Recorded via CustomRouteBuilder handler body injection ✓',
            'ok'      => $validated['ok'] ?? true,
        ]);
        return response()->json([
            'injected'  => true,
            'builder'   => 'CustomRouteBuilder v2.0',
            'handler'   => 'recordHandler',
            'probe_id'  => $record->id,
            'probe'     => $record->probe,
        ]);
    }

    /**
     * GET /api/body-endpoint-handler/latest
     */
    public function latest(Request $request, mixed ...$params): JsonResponse
    {

        $latest = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::latest()->take(5)->get();
        return response()->json([
            'injected' => true,
            'builder'  => 'CustomRouteBuilder v2.0',
            'handler'  => 'latest',
            'count'    => $latest->count(),
            'results'  => $latest,
        ]);
    }

}
