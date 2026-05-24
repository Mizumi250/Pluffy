<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — FieldController
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-24T15:01:59.834141Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Certflow;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\Certflow\Field;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class FieldController extends Controller
{
    /**
     * Add a new field to a template
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_id' => 'required|integer',
            'label' => 'required|string|max:100',
            'field_type' => 'sometimes|string|in:text,date,email,number',
            'x' => 'sometimes|integer',
            'y' => 'sometimes|integer',
            'width' => 'sometimes|integer',
            'height' => 'sometimes|integer',
            'font_size' => 'sometimes|integer',
            'font_family' => 'sometimes|string|max:100',
            'font_weight' => 'sometimes|string|max:20',
            'font_style' => 'sometimes|string|max:20',
            'text_align' => 'sometimes|string|in:left,center,right',
            'color' => 'sometimes|string|max:20',
            'placeholder' => 'nullable|string|max:200',
            'is_required' => 'sometimes|boolean'
        ]);

        $field = Field::create($validated);

        return response()->json($field, 201);
    }

    /**
     * Update field position, style, or label
     */
    public function update(Request $request, Field $field): JsonResponse
    {
        $validated = $request->validate([
            'label' => 'sometimes|string|max:100',
            'x' => 'sometimes|integer',
            'y' => 'sometimes|integer',
            'width' => 'sometimes|integer',
            'height' => 'sometimes|integer',
            'font_size' => 'sometimes|integer',
            'font_family' => 'sometimes|string|max:100',
            'font_weight' => 'sometimes|string|max:20',
            'font_style' => 'sometimes|string|max:20',
            'text_align' => 'sometimes|string|in:left,center,right',
            'color' => 'sometimes|string|max:20',
            'placeholder' => 'nullable|string|max:200',
            'layer_order' => 'sometimes|integer',
            'is_required' => 'sometimes|boolean'
        ]);

        $field->update($validated);

        return response()->json($field);
    }

    /**
     * Remove a field from a template
     */
    public function destroy(Field $field): JsonResponse
    {
        $field->delete();

        return response()->json(['message' => 'Field deleted']);
    }
}
