<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — PingController
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:31.269502Z
// ============================================================

namespace App\Http\Controllers\Arkzen\AspnetTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\AspnetTest\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PingController extends Controller
{
    /**
     * Public, but guarded by the requireJson C# middleware
     */
    public function ping(Request $request): JsonResponse
    {
        // Custom endpoint: ping
        // Add @arkzen:endpoint:ping ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
