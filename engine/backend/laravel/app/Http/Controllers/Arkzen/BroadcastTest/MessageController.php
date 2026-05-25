<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — MessageController
// Tatemono: broadcast-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-25T07:54:10.190241Z
// ============================================================

namespace App\Http\Controllers\Arkzen\BroadcastTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\BroadcastTest\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Get recent messages
     */
    public function index(Request $request): JsonResponse
    {
        $query = Message::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
         * Send a message and broadcast it on the selected channel type
         */
        public function store(Request $request): JsonResponse
        {
            $validated = $request->validate([
            'content' => 'required|string|max:500',
            'channel_type' => 'sometimes|string|max:50'
            ]);

            $message     = Message::create($validated);
            $channelType = $validated['channel_type'] ?? 'public';

            $map = [
                'public'   => '\App\Events\Arkzen\BroadcastTest\Broadcast\\MessageSentPublic',
                'private'  => '\App\Events\Arkzen\BroadcastTest\Broadcast\\MessageSentPrivate',
                'presence' => '\App\Events\Arkzen\BroadcastTest\Broadcast\\MessageSentPresence',
            ];

            if ($channelType === 'private') {
                broadcast(new \App\Events\Arkzen\BroadcastTest\Broadcast\MessageSentPrivate($request->user('sanctum')?->id, $message->toArray()));
            } elseif ($channelType === 'presence') {
                broadcast(new \App\Events\Arkzen\BroadcastTest\Broadcast\MessageSentPresence($message->toArray()));
            } else {
                broadcast(new \App\Events\Arkzen\BroadcastTest\Broadcast\MessageSentPublic($message->toArray()));
            }

            return response()->json($message, 201);
        }

    /**
     * Delete a message
     */
    public function destroy(Message $message): JsonResponse
    {
        $message->delete();

        return response()->json(['message' => 'Message deleted']);
    }
}
