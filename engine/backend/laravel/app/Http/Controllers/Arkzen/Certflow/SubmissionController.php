<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — SubmissionController
// Tatemono: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-24T01:36:31.899950Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Certflow;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\Certflow\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SubmissionController extends Controller
{
    /**
     * List all submissions with template info
     */
    public function index(Request $request): JsonResponse
    {
        $query = Submission::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Get a single submission by token for QR scan verification
     */
    public function show(Submission $submission): JsonResponse
    {
        return response()->json($submission);
    }
}
