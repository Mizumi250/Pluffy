<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — InventoryController
// Tatemono: inventory-management
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T14:30:30.718821Z
// ============================================================

namespace App\Http\Controllers\Arkzen\InventoryManagement;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\InventoryManagement\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class InventoryController extends Controller
{
    /**
     * Get paginated list of inventories
     */
    public function index(Request $request): JsonResponse
    {
        $query = Inventory::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->orWhere('name', 'like', '%' . $request->search . '%');
                $q->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Get single inventory item
     */
    public function show(Inventory $inventory): JsonResponse
    {
        return response()->json($inventory);
    }

    /**
     * Create new inventory item
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventory_management.inventory_management_inventories',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string'
        ]);

        $inventory = Inventory::create($validated);

        return response()->json($inventory, 201);
    }

    /**
     * Update inventory item
     */
    public function update(Request $request, Inventory $inventory): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'quantity' => 'sometimes|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string'
        ]);

        $inventory->update($validated);

        return response()->json($inventory);
    }

    /**
     * Delete inventory item
     */
    public function destroy(Inventory $inventory): JsonResponse
    {
        $inventory->delete();

        return response()->json(['message' => 'Item deleted successfully']);
    }
}
