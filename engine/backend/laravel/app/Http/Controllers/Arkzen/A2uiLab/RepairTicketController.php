<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — RepairTicketController
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T12:30:06.273639Z
// ============================================================

namespace App\Http\Controllers\Arkzen\A2uiLab;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\A2uiLab\RepairTicket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class RepairTicketController extends Controller
{
    /**
     * Look up repair tickets, filtered by code
     */
    public function index(Request $request): JsonResponse
    {
        $query = RepairTicket::query();

        if ($request->filled('code')) {
            $query->where('code', $request->code);
        }
        $perPage = $request->get('per_page', 5);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }
}
