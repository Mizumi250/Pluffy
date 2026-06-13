<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ItemController
// Tatemono: crud-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T02:03:42.125488Z
// ============================================================

namespace App\Http\Controllers\Arkzen\CrudTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\CrudTest\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\Arkzen\CrudTest\ItemResource;

class ItemController extends Controller
{
    use AuthorizesRequests;

    /**
     * Get all items
     */
    public function index(Request $request): JsonResponse
    {
        $query = Item::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(ItemResource::collection($results));
    }

    /**
     * Create item
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Item::class);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:active,pending,archived',
            'priority' => 'sometimes|integer|min:0',
            'tags' => 'nullable|string'
        ]);

        $item = Item::create($validated);

        return response()->json(new ItemResource($item), 201);
    }

    /**
     * Get single item
     */
    public function show(Item $item): JsonResponse
    {
        return response()->json(new ItemResource($item));
    }

    /**
     * Update item
     */
    public function update(Request $request, Item $item): JsonResponse
    {
        $this->authorize('update', $item);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:active,pending,archived',
            'priority' => 'sometimes|integer|min:0',
            'tags' => 'nullable|string'
        ]);

        $item->update($validated);

        return response()->json(new ItemResource($item));
    }

    /**
     * Delete item
     */
    public function destroy(Item $item): JsonResponse
    {
        $this->authorize('delete', $item);
        $item->delete();

        return response()->json(['message' => 'Item deleted']);
    }
}
