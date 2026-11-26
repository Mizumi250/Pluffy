<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ChipController
// Tatemono: kairo
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:48.374758Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Kairo;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\Kairo\Chip;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ChipController extends Controller
{
    /**
     * List chips saved to the shared library
     */
    public function index(Request $request): JsonResponse
    {
        $query = Chip::query();


        $perPage = $request->get('per_page', 100);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Save a chip blueprint to the shared library
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:60',
            'author' => 'sometimes|string|max:60',
            'note' => 'sometimes|string|max:160',
            'blueprint' => 'required|string'
        ]);

        $chip = Chip::create($validated);

        return response()->json($chip, 201);
    }
}
