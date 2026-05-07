<?php

namespace App\Http\Controllers\Arkzen\MiddlewareTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\MiddlewareTest\PingLog;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PingLogController extends Controller
{
    /**
     * Returns all ping logs — passes through requireJson middleware
     */
    public function index(Request $request): Response
    {
        $query = PingLog::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('MiddlewareTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Create a ping log entry — blocked by requireJson if Content-Type is wrong
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:255',
            'headers_ok' => 'sometimes|boolean',
        ]);

        $pingLog = PingLog::create($validated);

        return redirect()->back()->with('success', 'PingLog created successfully.');
    }
}
