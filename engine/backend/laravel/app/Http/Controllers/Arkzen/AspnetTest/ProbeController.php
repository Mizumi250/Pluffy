<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ProbeController
// Tatemono: aspnet-test
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-11-12T01:55:33.568412Z
// ============================================================

namespace App\Http\Controllers\Arkzen\AspnetTest;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ProbeController extends Controller
{
    /**
     * GET /api/aspnet-test/probe/{name}
     * Add @arkzen:handler:probe ... :end block to your tatemono to inject logic.
     */
    public function probe(Request $request, mixed ...$params): JsonResponse
    {
        $name = $params[0] ?? null;

        // TODO: Replace with your custom logic
        return response()->json([
            'tatemono' => 'aspnet-test',
            'handler'  => 'probe',
            'params'   => $params,
        ], 200);
    }

}
