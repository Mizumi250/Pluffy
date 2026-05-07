<?php

namespace App\Http\Controllers\Arkzen\QueueFlow;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\QueueFlow\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    /**
     * Get all tickets
     */
    public function index(Request $request): Response
    {
        $query = Ticket::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('QueueFlow/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Create a new ticket
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'queue_id' => 'required|integer|exists:queues,id',
            'customer_name' => 'nullable|string|max:255',
        ]);

        $ticket = Ticket::create($validated);

        return redirect()->back()->with('success', 'Ticket created successfully.');
    }

    /**
     * Update ticket status
     */
    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:waiting,serving,done,skipped',
        ]);

        $ticket->update($validated);

        return redirect()->back()->with('success', 'Ticket updated successfully.');
    }
}
