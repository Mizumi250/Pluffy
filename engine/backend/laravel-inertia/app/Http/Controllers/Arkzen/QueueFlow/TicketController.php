<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — TicketController
// Tatemono: queue-flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-29T02:41:50.576020Z
// ============================================================

namespace App\Http\Controllers\Arkzen\QueueFlow;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\QueueFlow\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Arkzen\QueueFlow\TicketResource;

class TicketController extends Controller
{
    /**
     * Get all tickets
     */
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(TicketResource::collection($results));
    }

    /**
     * Create a new ticket
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'queue_id' => 'required|integer|exists:queue_flow.queue_flow_queues,id',
            'customer_name' => 'nullable|string|max:255'
        ]);

        $ticket = Ticket::create($validated);

        return response()->json(new TicketResource($ticket), 201);
    }

    /**
     * Update ticket status
     */
    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:waiting,serving,done,skipped'
        ]);

        $ticket->update($validated);

        return response()->json(new TicketResource($ticket));
    }
}
