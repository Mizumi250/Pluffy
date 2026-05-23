<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — SimulateController
// Tatemono: errors-test
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-05-23T13:57:30.707812Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ErrorsTest;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class SimulateController extends Controller
{
    /**
     * GET /api/errors-test/simulate/{code}
     * Auto-generated simulation handler — returns the HTTP status from the URL.
     */
    public function simulate(Request $request, mixed ...$params): JsonResponse
    {
        $code = $params[0] ?? null;

        $code = isset($params[0]) ? (int)$params[0] : 200;
        $code = $code >= 100 && $code < 600 ? $code : 400;

        return response()->json([
            'simulated' => true,
            'code'      => $code,
        ], $code);
    }

}
