<?php

namespace App\Http\Controllers\Arkzen\NotificationTest;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $notifications = $request->user()->notifications()->paginate(20);
        return response()->json($notifications);
    }

    /**
     * Trigger a notification
     */
    public function store(Request $request): RedirectResponse
    {
        // TODO: implement store
        return redirect()->back()->with('success', 'Action completed.');
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, string $id): \Illuminate\Http\JsonResponse
    {
        $request->user()->notifications()->where('id', $id)->delete();
        return response()->json(['message' => 'Notification deleted.']);
    }

    /**
     * Mark all notifications as read
     */
    public function readAll(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
