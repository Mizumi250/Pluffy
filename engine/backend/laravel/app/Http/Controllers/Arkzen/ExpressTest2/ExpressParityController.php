<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ExpressParityController
// Tatemono: express-test-2
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-11-11T07:26:31.276715Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest2;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ExpressParityController extends Controller
{
    /**
     * GET /api/express-test-2/health/{name}
     * Add @arkzen:handler:health ... :end block to your tatemono to inject logic.
     */
    public function health(Request $request, mixed ...$params): JsonResponse
    {
        $name = $params[0] ?? null;

        // TODO: Replace with your custom logic
        return response()->json([
            'tatemono' => 'express-test-2',
            'handler'  => 'health',
            'params'   => $params,
        ], 200);
    }

    /**
     * POST /api/express-test-2/echo
     * Add @arkzen:handler:echo ... :end block to your tatemono to inject logic.
     */
    public function echo(Request $request, mixed ...$params): JsonResponse
    {

        // TODO: Replace with your custom logic
        return response()->json([
            'tatemono' => 'express-test-2',
            'handler'  => 'echo',
            'params'   => $params,
        ], 200);
    }

}
