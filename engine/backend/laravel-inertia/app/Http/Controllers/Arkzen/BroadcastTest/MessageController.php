<?php

namespace App\Http\Controllers\Arkzen\BroadcastTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\BroadcastTest\Message;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    /**
     * Get recent messages
     */
    public function index(Request $request): Response
    {
        $query = Message::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('BroadcastTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Send a message and broadcast it on the selected channel type
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:500',
            'channel_type' => 'sometimes|string|max:50',
        ]);

        $message = Message::create($validated);

        return redirect()->back()->with('success', 'Message created successfully.');
    }

    /**
     * Delete a message
     */
    public function destroy(Message $message): RedirectResponse
    {
        $message->delete();

        return redirect()->back()->with('success', 'Message deleted successfully.');
    }
}
