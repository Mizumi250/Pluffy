<?php

namespace App\Http\Controllers\Arkzen\ChurchCommunity;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\ChurchCommunity\Photo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PhotoController extends Controller
{
    /**
     * Get all photos with optional event_id or tag filter
     */
    public function index(Request $request): Response
    {
        $query = Photo::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('ChurchCommunity/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Upload a new photo and associate it with an event
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|integer|exists:church_community_events,id',
            'url' => 'required|string|max:500',
            'caption' => 'sometimes|string|max:500',
            'file_name' => 'required|string|max:255',
            'file_size' => 'sometimes|integer',
            'tags' => 'sometimes|array',
        ]);

        $photo = Photo::create($validated);

        return redirect()->back()->with('success', 'Photo created successfully.');
    }

    /**
     * Get a single photo with comments
     */
    public function show(Photo $photo): Response
    {
        return Inertia::render('ChurchCommunity/Show', [
            'photo' => $photo,
        ]);
    }

    /**
     * Update photo caption or tags
     */
    public function update(Request $request, Photo $photo): RedirectResponse
    {
        $validated = $request->validate([
            'caption' => 'sometimes|string|max:500',
            'tags' => 'sometimes|array',
        ]);

        $photo->update($validated);

        return redirect()->back()->with('success', 'Photo updated successfully.');
    }

    /**
     * Delete a photo (admin only)
     */
    public function destroy(Photo $photo): RedirectResponse
    {
        $photo->delete();

        return redirect()->back()->with('success', 'Photo deleted successfully.');
    }
}
