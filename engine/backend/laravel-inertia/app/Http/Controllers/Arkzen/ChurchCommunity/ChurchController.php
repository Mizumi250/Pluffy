<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ChurchController
// Tatemono: church-community
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-05-15T21:28:26.492098Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ChurchCommunity;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ChurchController extends Controller
{
    /**
     * GET /api/church-community/events/{event_id}/photos
     */
    public function event_photos(Request $request, mixed ...$params): JsonResponse
    {
        $event_id = $params[0] ?? null;

        $eventId = $params[0] ?? null;
        $event   = \App\Models\Arkzen\ChurchCommunity\Event::findOrFail($eventId);
        $photos  = \App\Models\Arkzen\ChurchCommunity\Photo::where('event_id', $eventId)
            ->with('uploader')->orderBy('created_at', 'desc')->get();
        return response()->json(['event' => $event, 'photos' => $photos]);
    }

    /**
     * POST /api/church-community/photos/{photo_id}/like
     */
    public function toggle_like(Request $request, mixed ...$params): JsonResponse
    {
        $photo_id = $params[0] ?? null;

        $photoId  = $params[0] ?? null;
        $userId   = $request->user()->id ?? 1;
        $photo    = \App\Models\Arkzen\ChurchCommunity\Photo::findOrFail($photoId);
        $existing = \App\Models\Arkzen\ChurchCommunity\PhotoLike::where('photo_id', $photoId)->where('user_id', $userId)->first();
        if ($existing) {
            $existing->delete();
            $photo->decrement('likes_count');
            $liked = false;
        } else {
            \App\Models\Arkzen\ChurchCommunity\PhotoLike::create(['photo_id' => $photoId, 'user_id' => $userId]);
            $photo->increment('likes_count');
            $liked = true;
        }
        return response()->json(['liked' => $liked, 'likes_count' => $photo->fresh()->likes_count]);
    }

    /**
     * GET /api/church-community/photos/{photo_id}/comments
     */
    public function photo_comments(Request $request, mixed ...$params): JsonResponse
    {
        $photo_id = $params[0] ?? null;

        $photoId  = $params[0] ?? null;
        $comments = \App\Models\Arkzen\ChurchCommunity\PhotoComment::where('photo_id', $photoId)
            ->with('user')->orderBy('created_at', 'asc')->get();
        return response()->json(['comments' => $comments]);
    }

    /**
     * POST /api/church-community/photos/{photo_id}/comments
     */
    public function add_comment(Request $request, mixed ...$params): JsonResponse
    {
        $photo_id = $params[0] ?? null;

        $photoId = $params[0] ?? null;
        $userId  = $request->user()->id ?? 1;
        $body    = $request->input('body');
        if (!$body) { return response()->json(['error' => 'Comment body required'], 422); }
        $comment = \App\Models\Arkzen\ChurchCommunity\PhotoComment::create(['photo_id' => $photoId, 'user_id' => $userId, 'body' => $body]);
        return response()->json(['comment' => $comment->load('user')]);
    }

    /**
     * GET /api/church-community/inventory
     */
    public function inventory_list(Request $request, mixed ...$params): JsonResponse
    {

        $tag     = $request->query('tag');
        $eventId = $request->query('event_id');
        $query   = \App\Models\Arkzen\ChurchCommunity\Photo::with(['event', 'uploader'])->orderBy('created_at', 'desc');
        if ($eventId) { $query->where('event_id', $eventId); }
        if ($tag)     { $query->whereJsonContains('tags', $tag); }
        $photos     = $query->paginate(20);
        $totalSize  = \App\Models\Arkzen\ChurchCommunity\Photo::sum('file_size');
        $totalCount = \App\Models\Arkzen\ChurchCommunity\Photo::count();
        $eventCount = \App\Models\Arkzen\ChurchCommunity\Event::count();
        $allTags    = \App\Models\Arkzen\ChurchCommunity\Photo::whereNotNull('tags')->pluck('tags')->flatten()->unique()->values();
        return response()->json(['photos' => $photos, 'total_count' => $totalCount, 'total_size' => $totalSize, 'event_count' => $eventCount, 'all_tags' => $allTags]);
    }

}
