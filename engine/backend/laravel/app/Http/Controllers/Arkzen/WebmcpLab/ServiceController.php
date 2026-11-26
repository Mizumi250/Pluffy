<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ServiceController
// Tatemono: webmcp-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:04:08.439328Z
// ============================================================

namespace App\Http\Controllers\Arkzen\WebmcpLab;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\WebmcpLab\Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    /**
     * List the workshop services and prices
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::query();


        $perPage = $request->get('per_page', 50);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }
}
