<?php

namespace App\Http\Controllers\Arkzen\ChurchCommunity;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\ChurchCommunity\Event;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Get all events ordered by event_date desc
     */
    public function index(Request $request): Response
    {
        $query = Event::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('ChurchCommunity/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Create a new church event
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'sometimes|string',
            'event_date' => 'required|date',
            'is_members_only' => 'sometimes|boolean',
        ]);

        $event = Event::create($validated);

        return redirect()->back()->with('success', 'Event created successfully.');
    }

    /**
     * Get a single event with its photos
     */
    public function show(Event $event): Response
    {
        return Inertia::render('ChurchCommunity/Show', [
            'event' => $event,
        ]);
    }

    /**
     * Update an existing event
     */
    public function update(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'event_date' => 'sometimes|date',
            'is_members_only' => 'sometimes|boolean',
        ]);

        $event->update($validated);

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    /**
     * Delete an event and its associated photos
     */
    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return redirect()->back()->with('success', 'Event deleted successfully.');
    }
}
