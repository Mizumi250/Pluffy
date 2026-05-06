<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — MemberController
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T13:26:25.765140Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ChurchCommunity;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\ChurchCommunity\Member;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Arkzen\ChurchCommunity\MemberResource;

class MemberController extends Controller
{
    /**
     * Get all active members optionally filtered by role
     */
    public function index(Request $request): JsonResponse
    {
        $query = Member::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json(MemberResource::collection($results));
    }

    /**
     * Create a new member record
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:pastor,elder,deacon,leader,member',
            'email' => 'sometimes|email|max:255',
            'bio' => 'sometimes|string',
            'joined_at' => 'sometimes|date'
        ]);

        $member = Member::create($validated);

        return response()->json(new MemberResource($member), 201);
    }

    /**
     * Get a single member record
     */
    public function show(Member $member): JsonResponse
    {
        return response()->json(new MemberResource($member));
    }

    /**
     * Update a member record
     */
    public function update(Request $request, Member $member): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:pastor,elder,deacon,leader,member',
            'email' => 'sometimes|email',
            'bio' => 'sometimes|string',
            'is_active' => 'sometimes|boolean'
        ]);

        $member->update($validated);

        return response()->json(new MemberResource($member));
    }

    /**
     * Remove a member from the directory
     */
    public function destroy(Member $member): JsonResponse
    {
        $member->delete();

        return response()->json(['message' => 'Member removed']);
    }
}
