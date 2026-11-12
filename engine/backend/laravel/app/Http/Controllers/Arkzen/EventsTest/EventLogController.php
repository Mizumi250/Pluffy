<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — EventLogController
// Tatemono: events-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:42.154148Z
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
        $perPage = $request->get('per_page', 100);
            $results = EventLog::query()->latest()->paginate($perPage);
            return response()->json($results);
    }

    /**
         * Fire an event
         */
        public function store(Request $request): JsonResponse
        {
            $validated = $request->validate([
            'event' => 'required|string',
            'payload' => 'nullable|array'
            ]);
    
            $eventClasses = array (
  'user-signed-up' => '\\App\\Events\\Arkzen\\EventsTest\\UserSignedUp',
  'order-placed' => '\\App\\Events\\Arkzen\\EventsTest\\OrderPlaced',
  'data-exported' => '\\App\\Events\\Arkzen\\EventsTest\\DataExported',
);
            $eventName = str_replace('_', '-', $validated['event']);
            $eventClass = $eventClasses[$eventName] ?? null;
            if (!$eventClass) return response()->json(['message' => 'Unknown event: ' . $eventName], 400);
    
            event(new $eventClass($validated['payload'] ?? []));
    
            return response()->json(['message' => 'Event fired'], 202);
        }

    /**
     * Clear all log entries
     */
    public function clearLog(Request $request): JsonResponse
    {
        \DB::table('event_log')->truncate();
            return response()->json(['message' => 'Log cleared']);
    }
}
