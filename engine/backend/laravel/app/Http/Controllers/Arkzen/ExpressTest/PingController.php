<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — PingController
// Tatemono: express-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:43.177860Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ExpressTest\JobResult;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PingController extends Controller
{
    /**
     * Public, passes requireJson
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobResult::query();


        $results = $query->orderBy('created_at', 'desc')->get();

        return response()->json($results);
    }
}
