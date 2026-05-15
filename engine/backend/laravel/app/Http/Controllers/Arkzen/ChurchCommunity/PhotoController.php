<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — PhotoController
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-15T03:46:22.335793Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ChurchCommunity;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ChurchCommunity\Photo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Arkzen\ChurchCommunity\PhotoResource;

class PhotoController extends Controller
{
    /**
     * Get all photos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Photo::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(PhotoResource::collection($results));
    }

    /**
     * Upload a new photo
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|integer|exists:church_community.church_community_events,id',
            'url' => 'required|string|max:500',
            'caption' => 'sometimes|string|max:500',
            'file_name' => 'required|string|max:255',
            'file_size' => 'sometimes|integer',
            'tags' => 'sometimes|array'
        ]);

        $photo = Photo::create($validated);

        return response()->json(new PhotoResource($photo), 201);
    }

    /**
     * Get a single photo
     */
    public function show(Photo $photo): JsonResponse
    {
        return response()->json(new PhotoResource($photo));
    }

    /**
     * Update a photo caption or tags
     */
    public function update(Request $request, Photo $photo): JsonResponse
    {
        $validated = $request->validate([
            'caption' => 'sometimes|string|max:500',
            'tags' => 'sometimes|array'
        ]);

        $photo->update($validated);

        return response()->json(new PhotoResource($photo));
    }

    /**
     * Delete a photo
     */
    public function destroy(Photo $photo): JsonResponse
    {
        $photo->delete();

        return response()->json(['message' => 'Photo deleted']);
    }
}
