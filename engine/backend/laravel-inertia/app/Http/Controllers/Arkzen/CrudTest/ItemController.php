<?php

namespace App\Http\Controllers\Arkzen\CrudTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\CrudTest\Item;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    /**
     * Get all items
     */
    public function index(Request $request): Response
    {
        $query = Item::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('CrudTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Create item
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:active,pending,archived',
            'priority' => 'sometimes|integer|min:0',
            'tags' => 'nullable|string',
        ]);

        $item = Item::create($validated);

        return redirect()->back()->with('success', 'Item created successfully.');
    }

    /**
     * Get single item
     */
    public function show(Item $item): Response
    {
        return Inertia::render('CrudTest/Show', [
            'item' => $item,
        ]);
    }

    /**
     * Update item
     */
    public function update(Request $request, Item $item): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:active,pending,archived',
            'priority' => 'sometimes|integer|min:0',
            'tags' => 'nullable|string',
        ]);

        $item->update($validated);

        return redirect()->back()->with('success', 'Item updated successfully.');
    }

    /**
     * Delete item
     */
    public function destroy(Item $item): RedirectResponse
    {
        $item->delete();

        return redirect()->back()->with('success', 'Item deleted successfully.');
    }
}
