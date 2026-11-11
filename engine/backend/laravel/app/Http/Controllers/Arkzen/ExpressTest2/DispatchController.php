<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — DispatchController
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.222008Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest2;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ExpressTest2\JobResult;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DispatchController extends Controller
{
    /**
         * Dispatch a queued job
         */
        public function store(Request $request): JsonResponse
        {
            $validated = $request->validate([
            'job' => 'required|string|in:process-record,always-fails',
            'data' => 'sometimes|array'
            ]);
    
            $jobClasses = array (
);
            $jobName = str_replace('_', '-', $validated['job']);
            $jobClass = $jobClasses[$jobName] ?? null;
            if (!$jobClass) return response()->json(['message' => 'Unknown job: ' . $jobName], 400);
    
            dispatch(new $jobClass($validated['data'] ?? []));
    
            return response()->json(['message' => 'Job dispatched'], 202);
        }
}
