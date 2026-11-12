<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — TicketController
// Tatemono: express-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:43.167559Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ExpressTest\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TicketController extends Controller
{
    use AuthorizesRequests;

    /**
     * List tickets
     */
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->orWhere('name', 'like', '%' . $request->search . '%');
                $q->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $perPage = $request->get('per_page', 10);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Create ticket
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Ticket::class);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'status' => 'sometimes|string|in:open,closed',
            'priority' => 'sometimes|integer|min:1',
            'done' => 'sometimes|boolean',
            'user_id' => 'sometimes|integer'
        ]);

        $ticket = Ticket::create($validated);

        return response()->json($ticket, 201);
    }

    /**
     * Show ticket
     */
    public function show(Ticket $ticket): JsonResponse
    {
        return response()->json($ticket);
    }

    /**
     * Update ticket
     */
    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('update', $ticket);
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:open,closed'
        ]);

        $ticket->update($validated);

        return response()->json($ticket);
    }

    /**
     * Delete ticket
     */
    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->authorize('delete', $ticket);
        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted']);
    }

    /**
     * Custom endpoint with a :ts body
     */
    public function stats(Request $request): JsonResponse
    {
        // Custom endpoint: stats
        // Add @arkzen:endpoint:stats ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
