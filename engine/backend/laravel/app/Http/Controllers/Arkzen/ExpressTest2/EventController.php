<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — EventController
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.229842Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest2;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ExpressTest2\EventLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    /**
         * Fire an event
         */
        public function store(Request $request): JsonResponse
        {
            $validated = $request->validate([
            'event' => 'required|string|in:record-created',
            'payload' => 'sometimes|array'
            ]);
    
            $eventClasses = array (
  'record-created' => '\\App\\Events\\Arkzen\\ExpressTest2\\RecordCreated',
);
            $eventName = str_replace('_', '-', $validated['event']);
            $eventClass = $eventClasses[$eventName] ?? null;
            if (!$eventClass) return response()->json(['message' => 'Unknown event: ' . $eventName], 400);
    
            event(new $eventClass($validated['payload'] ?? []));
    
            return response()->json(['message' => 'Event fired'], 202);
        }
}
