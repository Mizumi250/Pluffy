<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — EventController
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-20T06:38:22.714965Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ChurchCommunity;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ChurchCommunity\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Arkzen\ChurchCommunity\EventResource;

class EventController extends Controller
{
    /**
     * Get all events ordered by event_date desc
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(EventResource::collection($results));
    }

    /**
     * Create a new church event
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'sometimes|string',
            'event_date' => 'required|date',
            'is_members_only' => 'sometimes|boolean'
        ]);

        $event = Event::create($validated);

        return response()->json(new EventResource($event), 201);
    }

    /**
     * Get a single event with its photos
     */
    public function show(Event $event): JsonResponse
    {
        return response()->json(new EventResource($event));
    }

    /**
     * Update an existing church event
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'event_date' => 'sometimes|date',
            'is_members_only' => 'sometimes|boolean'
        ]);

        $event->update($validated);

        return response()->json(new EventResource($event));
    }

    /**
     * Delete a church event
     */
    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json(['message' => 'Event deleted']);
    }
}
