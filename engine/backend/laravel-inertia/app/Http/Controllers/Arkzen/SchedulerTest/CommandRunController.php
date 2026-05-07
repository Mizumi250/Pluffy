<?php

namespace App\Http\Controllers\Arkzen\SchedulerTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\SchedulerTest\CommandRun;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CommandRunController extends Controller
{
    /**
     * Get all command run records
     */
    public function index(Request $request): Response
    {
        $query = CommandRun::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('SchedulerTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Execute a command and record the result
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'command' => 'required|string',
            'triggered_by' => 'sometimes|string',
        ]);

        $commandRun = CommandRun::create($validated);

        return redirect()->back()->with('success', 'CommandRun created successfully.');
    }

    /**
     * Clear all run records
     */
    public function destroy(CommandRun $commandRun): RedirectResponse
    {
        $commandRun->delete();

        return redirect()->back()->with('success', 'CommandRun deleted successfully.');
    }
}
