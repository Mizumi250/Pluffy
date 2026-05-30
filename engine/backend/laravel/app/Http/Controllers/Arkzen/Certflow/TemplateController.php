<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — TemplateController
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T13:15:55.379169Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Certflow;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\Certflow\Template;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TemplateController extends Controller
{
    /**
     * List all templates with their fields
     */
    public function index(Request $request): JsonResponse
    {
        $query = Template::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Create a new template
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'global_font' => 'sometimes|string|max:100'
        ]);

        $template = Template::create($validated);

        return response()->json($template, 201);
    }

    /**
     * Get a single template with fields
     */
    public function show(Template $template): JsonResponse
    {
        return response()->json($template);
    }

    /**
     * Update template metadata or global font
     */
    public function update(Request $request, Template $template): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'global_font' => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:500'
        ]);

        $template->update($validated);

        return response()->json($template);
    }

    /**
     * Delete a template and all its fields
     */
    public function destroy(Template $template): JsonResponse
    {
        $template->delete();

        return response()->json(['message' => 'Template deleted']);
    }
}
