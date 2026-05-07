<?php

namespace App\Http\Controllers\Arkzen\InventoryManagement;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\InventoryManagement\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Get paginated list of inventories
     */
    public function index(Request $request): Response
    {
        $query = Inventory::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('InventoryManagement/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Get single inventory item
     */
    public function show(Inventory $inventory): Response
    {
        return Inertia::render('InventoryManagement/Show', [
            'inventory' => $inventory,
        ]);
    }

    /**
     * Create new inventory item
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventories',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $inventory = Inventory::create($validated);

        return redirect()->back()->with('success', 'Inventory created successfully.');
    }

    /**
     * Update inventory item
     */
    public function update(Request $request, Inventory $inventory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'quantity' => 'sometimes|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $inventory->update($validated);

        return redirect()->back()->with('success', 'Inventory updated successfully.');
    }

    /**
     * Delete inventory item
     */
    public function destroy(Inventory $inventory): RedirectResponse
    {
        $inventory->delete();

        return redirect()->back()->with('success', 'Inventory deleted successfully.');
    }
}
