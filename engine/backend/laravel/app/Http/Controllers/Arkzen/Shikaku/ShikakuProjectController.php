<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ShikakuProjectController
// Tatemono: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-26T07:09:02.922391Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Shikaku;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\Shikaku\ShikakuProject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ShikakuProjectController extends Controller
{
    /**
     * List all projects for current user
     */
    public function index(Request $request): JsonResponse
    {
        $query = ShikakuProject::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Create a new pixel art project
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'width' => 'required|integer|in:8,16,32,64,128',
            'height' => 'required|integer|in:8,16,32,64,128'
        ]);

        $shikakuProject = ShikakuProject::create($validated);

        return response()->json($shikakuProject, 201);
    }

    /**
     * Load a project with its latest save
     */
    public function show(ShikakuProject $shikakuProject): JsonResponse
    {
        return response()->json($shikakuProject);
    }

    /**
     * Update project name or thumbnail
     */
    public function update(Request $request, ShikakuProject $shikakuProject): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'thumbnail' => 'sometimes|nullable|string'
        ]);

        $shikakuProject->update($validated);

        return response()->json($shikakuProject);
    }

    /**
     * Delete project and all its saves
     */
    public function destroy(ShikakuProject $shikakuProject): JsonResponse
    {
        $shikakuProject->delete();

        return response()->json(['message' => 'Project deleted']);
    }
}
