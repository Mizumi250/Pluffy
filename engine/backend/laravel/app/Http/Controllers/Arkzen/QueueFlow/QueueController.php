<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — QueueController
// Tatemono: queue-flow
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-05-27T12:27:37.711303Z
// ============================================================

namespace App\Http\Controllers\Arkzen\QueueFlow;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class QueueController extends Controller
{
    /**
     * POST /api/queue-flow/join
     */
    public function join_queue(Request $request, mixed ...$params): JsonResponse
    {

        $queueId      = $request->input('queue_id');
        $customerName = $request->input('customer_name', 'Guest');
        
        $queue = \App\Models\Arkzen\QueueFlow\Queue::findOrFail($queueId);
        
        $lastPosition = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
          ->whereIn('status', ['waiting', 'serving'])
          ->max('position') ?? 0;
        
        $ticket = \App\Models\Arkzen\QueueFlow\Ticket::create([
          'queue_id'      => $queueId,
          'ticket_number' => $queue->prefix . '-' . str_pad($lastPosition + 1, 3, '0', STR_PAD_LEFT),
          'customer_name' => $customerName,
          'status'        => 'waiting',
          'position'      => $lastPosition + 1,
        ]);
        
        $waiting = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
          ->where('status', 'waiting')
          ->where('position', '<', $ticket->position)
          ->count();
        
        try {
          broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([
            'queue_id' => $queueId,
            'action'   => 'joined',
            'ticket'   => $ticket,
          ]))->toOthers();
        } catch (\Throwable $e) {
          \Illuminate\Support\Facades\Log::warning('[QueueFlow] broadcast failed: ' . $e->getMessage());
        }
        
        return response()->json([
          'ticket'         => $ticket,
          'position'       => $waiting + 1,
          'estimated_wait' => ($waiting) * $queue->avg_wait_minutes,
        ]);
    }

    /**
     * POST /api/queue-flow/call-next
     */
    public function call_next(Request $request, mixed ...$params): JsonResponse
    {

        $queueId = $request->input('queue_id');
        
        // Mark current serving as done
        \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
          ->where('status', 'serving')
          ->update(['status' => 'done', 'served_at' => now()]);
        
        // Get next waiting ticket
        $next = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
          ->where('status', 'waiting')
          ->orderBy('position')
          ->first();
        
        if (!$next) {
          return response()->json(['message' => 'No more tickets in queue', 'ticket' => null]);
        }
        
        $next->update(['status' => 'serving', 'called_at' => now()]);
        
        try {
          broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([
            'queue_id' => $queueId,
            'action'   => 'called',
            'ticket'   => $next,
          ]))->toOthers();
        } catch (\Throwable $e) {
          \Illuminate\Support\Facades\Log::warning('[QueueFlow] broadcast failed: ' . $e->getMessage());
        }
        
        return response()->json(['ticket' => $next]);
    }

    /**
     * GET /api/queue-flow/status/{queue_id}
     */
    public function queue_status(Request $request, mixed ...$params): JsonResponse
    {
        $queue_id = $params[0] ?? null;

        $queueId = $params[0] ?? null;
        
        $queue = \App\Models\Arkzen\QueueFlow\Queue::findOrFail($queueId);
        
        $serving = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
          ->where('status', 'serving')
          ->first();
        
        $waiting = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
          ->where('status', 'waiting')
          ->orderBy('position')
          ->get();
        
        $done_count = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
          ->where('status', 'done')
          ->count();
        
        return response()->json([
          'queue'      => $queue,
          'serving'    => $serving,
          'waiting'    => $waiting,
          'done_count' => $done_count,
          'total_waiting' => $waiting->count(),
        ]);
    }

    /**
     * GET /api/queue-flow/my-ticket/{queue_id}/{ticket_number}
     */
    public function my_ticket(Request $request, mixed ...$params): JsonResponse
    {
        $queue_id = $params[0] ?? null;
        $ticket_number = $params[1] ?? null;

        $ticketNumber = $params[1] ?? null;
        $queueId      = $params[0] ?? null;
        
        $ticket = \App\Models\Arkzen\QueueFlow\Ticket::where('ticket_number', $ticketNumber)
          ->where('queue_id', $queueId)
          ->firstOrFail();
        
        $ahead = \App\Models\Arkzen\QueueFlow\Ticket::where('queue_id', $queueId)
          ->where('status', 'waiting')
          ->where('position', '<', $ticket->position)
          ->count();
        
        $queue = \App\Models\Arkzen\QueueFlow\Queue::find($queueId);
        
        return response()->json([
          'ticket'         => $ticket,
          'position'       => $ticket->status === 'waiting' ? $ahead + 1 : 0,
          'estimated_wait' => $ahead * ($queue->avg_wait_minutes ?? 5),
          'is_serving'     => $ticket->status === 'serving',
          'is_done'        => $ticket->status === 'done',
        ]);
    }

}
