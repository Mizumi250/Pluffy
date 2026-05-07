<?php

namespace App\Http\Controllers\Arkzen\JobTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\JobTest\JobResult;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class JobResultController extends Controller
{
    /**
     * Get all job results
     */
    public function index(Request $request): Response
    {
        $query = JobResult::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('JobTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Dispatch a job
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'job' => 'required|string',
        ]);

        $jobResult = JobResult::create($validated);

        return redirect()->back()->with('success', 'JobResult created successfully.');
    }
}
