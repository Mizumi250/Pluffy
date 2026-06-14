<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ProbeResultController
// Tatemono: body-endpoint-handler
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T06:15:35.583593Z
// ============================================================

namespace App\Http\Controllers\Arkzen\BodyEndpointHandler;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\BodyEndpointHandler\ProbeResult;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProbeResultController extends Controller
{
    /**
     * List all probe results
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProbeResult::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Create a probe result entry — standard store, not body-injected, kept as baseline
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source' => 'required|string|max:50',
            'probe' => 'required|string|max:100',
            'payload' => 'nullable|string'
        ]);

        $probeResult = ProbeResult::create($validated);

        return response()->json($probeResult, 201);
    }

    /**
     * Custom endpoint — @arkzen:endpoint body injection. Echoes the request body back with metadata. Tests ControllerBuilder v7.0 body injection.
     */
    public function echo(Request $request): JsonResponse
    {
        $input   = $request->all();
        $count   = count($input);
        $record  = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::create([
            'source'  => 'endpoint-body',
            'probe'   => 'echo',
            'payload' => json_encode($input),
            'result'  => "Echoed {$count} field(s) — ControllerBuilder v7.0 body injection ✓",
            'ok'      => true,
        ]);
        return response()->json([
            'injected'    => true,
            'builder'     => 'ControllerBuilder v7.0',
            'method'      => 'echo',
            'field_count' => $count,
            'echo'        => $input,
            'probe_id'    => $record->id,
        ]);
    }

    /**
     * Custom endpoint — @arkzen:endpoint body injection. Returns aggregate counts from probe_results. Tests ControllerBuilder v7.0 body injection.
     */
    public function stats(Request $request): JsonResponse
    {
        $total   = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::count();
        $passed  = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::where('ok', true)->count();
        $failed  = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::where('ok', false)->count();
        $sources = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::select('source')
                       ->distinct()
                       ->pluck('source');
        return response()->json([
            'injected' => true,
            'builder'  => 'ControllerBuilder v7.0',
            'method'   => 'stats',
            'total'    => $total,
            'passed'   => $passed,
            'failed'   => $failed,
            'sources'  => $sources,
        ]);
    }

    /**
     * Delete a probe result
     */
    public function destroy(ProbeResult $probeResult): JsonResponse
    {
        $probeResult->delete();

        return response()->json(['message' => 'Probe deleted']);
    }
}
