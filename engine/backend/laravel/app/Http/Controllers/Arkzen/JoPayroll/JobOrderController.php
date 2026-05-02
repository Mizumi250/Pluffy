<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — JobOrderController
// Tatemono: jo-payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-02T10:11:38.375316Z
// ============================================================

namespace App\Http\Controllers\Arkzen\JoPayroll;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\JoPayroll\JobOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Arkzen\JoPayroll\JobOrderResource;

class JobOrderController extends Controller
{
    /**
     * List all job orders
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobOrder::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(JobOrderResource::collection($results));
    }

    /**
     * Create a new job order
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jor_number' => 'required|integer|min:0',
            'name_of_jo' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'funding' => 'required|string|max:255',
            'basic_pay' => 'required|numeric|min:0',
            'disbursement_type' => 'required|string|in:CASH,ATM',
            'status' => 'string|in:active,inactive'
        ]);

        $jobOrder = JobOrder::create($validated);

        return response()->json(new JobOrderResource($jobOrder), 201);
    }

    /**
     * Get single job order
     */
    public function show(JobOrder $jobOrder): JsonResponse
    {
        return response()->json(new JobOrderResource($jobOrder));
    }

    /**
     * Update job order
     */
    public function update(Request $request, JobOrder $jobOrder): JsonResponse
    {
        $validated = $request->validate([
            'jor_number' => 'integer|min:0',
            'name_of_jo' => 'string|max:255',
            'job_title' => 'string|max:255',
            'funding' => 'string|max:255',
            'basic_pay' => 'numeric|min:0',
            'disbursement_type' => 'string|in:CASH,ATM',
            'status' => 'string|in:active,inactive'
        ]);

        $jobOrder->update($validated);

        return response()->json(new JobOrderResource($jobOrder));
    }

    /**
     * Delete job order
     */
    public function destroy(JobOrder $jobOrder): JsonResponse
    {
        $jobOrder->delete();

        return response()->json(['message' => 'Job order deleted successfully']);
    }

    /**
     * Get payroll summary statistics
     */
    public function summary(Request $request): JsonResponse
    {
        // Custom endpoint: summary
        // Add @arkzen:endpoint:summary ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }

    /**
     * Get job orders by payroll group
     */
    public function byGroup(Request $request): JsonResponse
    {
        // Custom endpoint: byGroup
        // Add @arkzen:endpoint:byGroup ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }

    /**
     * Get appointment sequence list
     */
    public function appointments(Request $request): JsonResponse
    {
        // Custom endpoint: appointments
        // Add @arkzen:endpoint:appointments ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
