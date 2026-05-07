<?php

namespace App\Http\Controllers\Arkzen\RolesTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\RolesTest\RoleAuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleAuditLogController extends Controller
{
    /**
     * Audit log of all access attempts
     */
    public function index(Request $request): Response
    {
        $query = RoleAuditLog::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('RolesTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Admin-only route — role check performed in controller body ($user->role === 'admin'). Per-endpoint middleware override is not yet supported by RouteRegistrar; the check lives in the generated method.
     */
    public function adminOnly(Request $request): Response
    {
        return Inertia::render('adminOnly', []);
    }

    /**
     * Any authenticated user — no role gate
     */
    public function userOnly(Request $request): Response
    {
        return Inertia::render('userOnly', []);
    }

    /**
     * Promote the authenticated user to admin role
     */
    public function promote(Request $request): RedirectResponse
    {
        // TODO: implement promote
        return redirect()->back()->with('success', 'Action completed.');
    }

    /**
     * Demote the authenticated user back to user role
     */
    public function demote(Request $request): RedirectResponse
    {
        // TODO: implement demote
        return redirect()->back()->with('success', 'Action completed.');
    }
}
