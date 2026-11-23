<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ServiceController
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:03:44.769567Z
// ============================================================

namespace App\Http\Controllers\Arkzen\A2uiLab;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\A2uiLab\Service;
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
