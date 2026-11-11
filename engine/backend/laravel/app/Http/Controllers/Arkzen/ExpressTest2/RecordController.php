<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — RecordController
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.193180Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest2;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ExpressTest2\TestRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\Arkzen\ExpressTest2\TestRecordResource;

class RecordController extends Controller
{
    use AuthorizesRequests;

    /**
     * List records with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = TestRecord::query();

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

        return response()->json(TestRecordResource::collection($results));
    }

    /**
     * Create a record
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', TestRecord::class);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'status' => 'sometimes|string|in:open,closed',
            'priority' => 'sometimes|integer|min:1',
            'done' => 'sometimes|boolean'
        ]);

        $testRecord = TestRecord::create($validated);

        return response()->json(new TestRecordResource($testRecord), 201);
    }

    /**
     * Show a record
     */
    public function show(TestRecord $testRecord): JsonResponse
    {
        return response()->json(new TestRecordResource($testRecord));
    }

    /**
     * Update a record
     */
    public function update(Request $request, TestRecord $testRecord): JsonResponse
    {
        $this->authorize('update', $testRecord);
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:open,closed'
        ]);

        $testRecord->update($validated);

        return response()->json(new TestRecordResource($testRecord));
    }

    /**
     * Delete a record
     */
    public function destroy(TestRecord $testRecord): JsonResponse
    {
        $this->authorize('delete', $testRecord);
        $testRecord->delete();

        return response()->json(['message' => 'TestRecord deleted']);
    }

    /**
     * Aggregate records
     */
    public function stats(Request $request): JsonResponse
    {
        // Custom endpoint: stats
        // Add @arkzen:endpoint:stats ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
