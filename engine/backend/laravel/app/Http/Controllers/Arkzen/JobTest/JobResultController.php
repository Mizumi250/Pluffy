<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — JobResultController
// Tatemono: job-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T14:06:49.057119Z
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
        $query = JobResult::query();


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
                'job' => 'required|string'
            ]);
    
            $jobClass = match($validated['job']) {
                'process-data' => \App\Jobs\Arkzen\JobTest\ProcessDataJob::class,
                'heavy-computation' => \App\Jobs\Arkzen\JobTest\HeavyComputationJob::class,
                'always-fails' => \App\Jobs\Arkzen\JobTest\AlwaysFailsJob::class,
                default => throw new \Exception('Unknown job: ' . $validated['job']),
            };
    
            dispatch(new $jobClass());
    
            return response()->json(['message' => 'Job dispatched'], 202);
        }
}
