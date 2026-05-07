<?php

namespace App\Http\Controllers\Arkzen\EventsTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\EventsTest\EventLog;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventLogController extends Controller
{
    /**
     * Get event log entries
     */
    public function index(Request $request): Response
    {
        $query = EventLog::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('EventsTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Fire an event
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event' => 'required|string',
            'payload' => 'nullable|array',
        ]);

        $eventLog = EventLog::create($validated);

        return redirect()->back()->with('success', 'EventLog created successfully.');
    }

    /**
     * Clear all log entries
     */
    public function clearLog(Request $request): RedirectResponse
    {
        // TODO: implement clearLog
        return redirect()->back()->with('success', 'Action completed.');
    }
}
