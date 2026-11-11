<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — JobResultController
// Tatemono: job-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:45.457478Z
// ============================================================

namespace App\Http\Controllers\Arkzen\JobTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\JobTest\JobResult;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class JobResultController extends Controller
{
    /**
     * Get all job results
     */
    public function index(Request $request): JsonResponse
    {
        $query = \App\Models\Arkzen\JobTest\JobResult::query();
        $query->orderBy('created_at', 'desc');
        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);
        return response()->json($results);
    }

    /**
         * Dispatch a job
         */
        public function store(Request $request): JsonResponse
        {
            $validated = $request->validate([
            'job' => 'required|string',
            'data' => 'sometimes|array'
            ]);
    
            $jobClasses = array (
  'process-data' => '\\App\\Jobs\\Arkzen\\JobTest\\ProcessDataJob',
  'heavy-computation' => '\\App\\Jobs\\Arkzen\\JobTest\\HeavyComputationJob',
  'always-fails' => '\\App\\Jobs\\Arkzen\\JobTest\\AlwaysFailsJob',
);
            $jobName = str_replace('_', '-', $validated['job']);
            $jobClass = $jobClasses[$jobName] ?? null;
            if (!$jobClass) return response()->json(['message' => 'Unknown job: ' . $jobName], 400);
    
            dispatch(new $jobClass($validated['data'] ?? []));
    
            return response()->json(['message' => 'Job dispatched'], 202);
        }
}
