<?php

namespace App\Http\Controllers\Arkzen\MailTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\MailTest\MailLog;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MailLogController extends Controller
{
    /**
     * Get all mail logs
     */
    public function index(Request $request): Response
    {
        $query = MailLog::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('MailTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Send an email
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mail' => 'required|string',
            'to' => 'required|email',
            'data' => 'array',
        ]);

        $mailLog = MailLog::create($validated);

        return redirect()->back()->with('success', 'MailLog created successfully.');
    }
}
