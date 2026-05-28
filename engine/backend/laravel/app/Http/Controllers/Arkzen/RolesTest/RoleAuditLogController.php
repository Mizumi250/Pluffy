<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — RoleAuditLogController
// Tatemono: roles-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-28T13:11:57.644597Z
// ============================================================

namespace App\Http\Controllers\Arkzen\RolesTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\RolesTest\RoleAuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class RoleAuditLogController extends Controller
{
    /**
     * Audit log of all access attempts
     */
    public function index(Request $request): JsonResponse
    {
        $query = RoleAuditLog::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Admin-only route — role check performed in controller body ($user->role === 'admin'). Per-endpoint middleware override is not yet supported by RouteRegistrar; the check lives in the generated method.
     */
    public function adminOnly(Request $request): JsonResponse
    {
        $user    = $request->user();
        $granted = $user && $user->role === 'admin';

        RoleAuditLog::create([
            'user_id'       => $user?->id,
            'action'        => 'GET /admin-only',
            'role_required' => 'admin',
            'granted'       => $granted,
        ]);

        if (!$granted) {
            return response()->json(['message' => '✗ Access denied — admin role required'], 403);
        }

        return response()->json(['message' => '✓ Access granted — you are admin']);
    }

    /**
     * Any authenticated user — no role gate
     */
    public function userOnly(Request $request): JsonResponse
    {
        $user = $request->user();

        RoleAuditLog::create([
            'user_id'       => $user?->id,
            'action'        => 'GET /user-only',
            'role_required' => 'user',
            'granted'       => true,
        ]);

        return response()->json(['message' => '✓ Access granted — open to all authenticated users']);
    }

    /**
     * Promote the authenticated user to admin role
     */
    public function promote(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['role' => 'admin']);

        return response()->json(['message' => 'Promoted to admin', 'user' => $user->fresh()]);
    }

    /**
     * Demote the authenticated user back to user role
     */
    public function demote(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['role' => 'user']);

        return response()->json(['message' => 'Demoted to user', 'user' => $user->fresh()]);
    }
}
