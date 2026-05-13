<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — EventLogController
// Tatemono: events-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-13T10:51:35.168539Z
// ============================================================

namespace App\Http\Controllers\Arkzen\EventsTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\EventsTest\EventLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class EventLogController extends Controller
{
    /**
     * Get event log entries
     */
    public function index(Request $request): JsonResponse
    {
        $query = EventLog::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
         * Fire an event
         */
        public function store(Request $request): JsonResponse
        {
            $validated = $request->validate([
                'event' => 'required|string',
                'payload' => 'sometimes|array'
            ]);
    
            $eventClass = match($validated['event']) {
                'user-signed-up' => \App\Events\Arkzen\EventsTest\UserSignedUp::class,
                'order-placed' => \App\Events\Arkzen\EventsTest\OrderPlaced::class,
                'data-exported' => \App\Events\Arkzen\EventsTest\DataExported::class,
                default => throw new \Exception('Unknown event: ' . $validated['event']),
            };
    
            event(new $eventClass($validated['payload'] ?? []));
    
            return response()->json(['message' => 'Event fired'], 202);
        }

    /**
     * Clear all log entries
     */
    public function clearLog(Request $request): JsonResponse
    {
        // Custom endpoint: clearLog
        // Add @arkzen:endpoint:clearLog ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
