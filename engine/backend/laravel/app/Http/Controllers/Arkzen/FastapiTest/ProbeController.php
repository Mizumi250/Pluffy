<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ProbeController
// Tatemono: fastapi-test
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-11-12T01:55:46.241609Z
// ============================================================

namespace App\Http\Controllers\Arkzen\FastapiTest;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ProbeController extends Controller
{
    /**
     * GET /api/fastapi-test/probe/{name}
     * Add @arkzen:handler:probe ... :end block to your tatemono to inject logic.
     */
    public function probe(Request $request, mixed ...$params): JsonResponse
    {
        $name = $params[0] ?? null;

        // TODO: Replace with your custom logic
        return response()->json([
            'tatemono' => 'fastapi-test',
            'handler'  => 'probe',
            'params'   => $params,
        ], 200);
    }

}
