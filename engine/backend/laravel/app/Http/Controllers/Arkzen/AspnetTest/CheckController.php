<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — CheckController
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:31.250523Z
// ============================================================

namespace App\Http\Controllers\Arkzen\AspnetTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\AspnetTest\Check;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\Arkzen\AspnetTest\CheckResource;

class CheckController extends Controller
{
    use AuthorizesRequests;

    /**
     * List checks with search, status filter and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Check::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->orWhere('name', 'like', '%' . $request->search . '%');
                $q->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $perPage = $request->get('per_page', 10);
        $results = $query->paginate($perPage);

        return response()->json(CheckResource::collection($results));
    }

    /**
     * Create a check
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Check::class);
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'status' => 'sometimes|string|in:pending,passed,failed',
            'priority' => 'sometimes|integer|min:1',
            'done' => 'sometimes|boolean',
            'user_id' => 'sometimes|integer'
        ]);

        $check = Check::create($validated);

        return response()->json(new CheckResource($check), 201);
    }

    /**
     * Show a check
     */
    public function show(Check $check): JsonResponse
    {
        return response()->json(new CheckResource($check));
    }

    /**
     * Update a check (owner or admin, enforced by the C# policy)
     */
    public function update(Request $request, Check $check): JsonResponse
    {
        $this->authorize('update', $check);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:120',
            'status' => 'sometimes|string|in:pending,passed,failed',
            'priority' => 'sometimes|integer|min:1',
            'done' => 'sometimes|boolean'
        ]);

        $check->update($validated);

        return response()->json(new CheckResource($check));
    }

    /**
     * Delete a check (admin only, enforced by the C# policy)
     */
    public function destroy(Check $check): JsonResponse
    {
        $this->authorize('delete', $check);
        $check->delete();

        return response()->json(['message' => 'Check deleted successfully']);
    }

    /**
     * Mark a check passed and write an audit row in one transaction
     */
    public function pass(Request $request): JsonResponse
    {
        // Custom endpoint: pass
        // Add @arkzen:endpoint:pass ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }

    /**
     * Custom C# endpoint that aggregates checks by status
     */
    public function stats(Request $request): JsonResponse
    {
        // Custom endpoint: stats
        // Add @arkzen:endpoint:stats ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
