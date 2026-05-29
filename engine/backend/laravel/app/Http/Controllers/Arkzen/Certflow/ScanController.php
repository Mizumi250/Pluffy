<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ScanController
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-29T01:01:06.348177Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Certflow;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\Certflow\Scan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ScanController extends Controller
{
    /**
     * List all scans with submission info
     */
    public function index(Request $request): JsonResponse
    {
        $query = Scan::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }
}
