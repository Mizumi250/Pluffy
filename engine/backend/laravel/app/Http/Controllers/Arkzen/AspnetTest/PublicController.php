<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — PublicController
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:31.257008Z
// ============================================================

namespace App\Http\Controllers\Arkzen\AspnetTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\AspnetTest\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PublicController extends Controller
{
    /**
     * Public health endpoint with a live row count
     */
    public function health(Request $request): JsonResponse
    {
        // Custom endpoint: health
        // Add @arkzen:endpoint:health ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
