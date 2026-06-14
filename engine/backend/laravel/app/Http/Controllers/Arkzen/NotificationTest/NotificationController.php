<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — NotificationController
// Tatemono: notification-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T07:22:18.782560Z
// ============================================================

namespace App\Http\Controllers\Arkzen\NotificationTest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->latest()->get();
        return response()->json(['data' => $notifications]);
    }

    /**
         * Trigger a notification
         */
        public function store(Request $request): JsonResponse
        {
            $validated = $request->validate([
                'notification' => 'required|string'
            ]);
    
            $user = $request->user();
            $notificationKey = $validated['notification'];
    
            $className = \Illuminate\Support\Str::studly(str_replace('-', '_', $notificationKey)) . 'Notification';
            $fullClass = "\\App\\Notifications\\Arkzen\\NotificationTest\\" . $className;
    
            if (!class_exists($fullClass)) {
                throw new \InvalidArgumentException('Unknown notification type: ' . $notificationKey);
            }
    
            $user->notify(new $fullClass($user));
    
            return response()->json([
                'message' => 'Notification triggered successfully',
                'type'    => $notificationKey,
            ], 201);
        }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->delete();
        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Mark all notifications as read
     */
    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);
        return response()->json(['message' => 'All notifications marked as read']);
    }
}
