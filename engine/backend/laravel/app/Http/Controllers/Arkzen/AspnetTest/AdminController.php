<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — AdminController
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:33.527298Z
// ============================================================

namespace App\Http\Controllers\Arkzen\AspnetTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\AspnetTest\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Latest audit rows, admin role only
     */
    public function audit(Request $request): JsonResponse
    {
        // Custom endpoint: audit
        // Add @arkzen:endpoint:audit ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
