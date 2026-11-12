<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ProbeController
// Tatemono: express-test
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-11-12T01:55:43.183617Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ProbeController extends Controller
{
    /**
     * GET /api/express-test/probe/{name}
     * Add @arkzen:handler:probe ... :end block to your tatemono to inject logic.
     */
    public function probe(Request $request, mixed ...$params): JsonResponse
    {
        $name = $params[0] ?? null;

        // TODO: Replace with your custom logic
        return response()->json([
            'tatemono' => 'express-test',
            'handler'  => 'probe',
            'params'   => $params,
        ], 200);
    }

}
