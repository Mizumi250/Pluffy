<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — UiReleaseController
// Tatemono: mobile-sdui
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:59.360912Z
// ============================================================

namespace App\Http\Controllers\Arkzen\MobileSdui;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\MobileSdui\UiRelease;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class UiReleaseController extends Controller
{
    /**
     * List published and scheduled mobile UI releases
     */
    public function index(Request $request): JsonResponse
    {
        $query = UiRelease::query();


        $perPage = $request->get('per_page', 100);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Publish a validated mobile button configuration
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'configuration' => 'required|string|max:10000',
            'activate_at' => 'required|string|max:40'
        ]);

        $uiRelease = UiRelease::create($validated);

        return response()->json($uiRelease, 201);
    }
}
