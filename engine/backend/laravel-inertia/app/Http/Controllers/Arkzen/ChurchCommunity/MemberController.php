<?php

namespace App\Http\Controllers\Arkzen\ChurchCommunity;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\ChurchCommunity\Member;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    /**
     * Get all active members optionally filtered by role
     */
    public function index(Request $request): Response
    {
        $query = Member::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('ChurchCommunity/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Create a new member record
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:pastor,elder,deacon,leader,member',
            'email' => 'sometimes|email|max:255',
            'bio' => 'sometimes|string',
            'joined_at' => 'sometimes|date',
        ]);

        $member = Member::create($validated);

        return redirect()->back()->with('success', 'Member created successfully.');
    }

    /**
     * Get a single member record
     */
    public function show(Member $member): Response
    {
        return Inertia::render('ChurchCommunity/Show', [
            'member' => $member,
        ]);
    }

    /**
     * Update a member record
     */
    public function update(Request $request, Member $member): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:pastor,elder,deacon,leader,member',
            'email' => 'sometimes|email',
            'bio' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $member->update($validated);

        return redirect()->back()->with('success', 'Member updated successfully.');
    }

    /**
     * Remove a member from the directory
     */
    public function destroy(Member $member): RedirectResponse
    {
        $member->delete();

        return redirect()->back()->with('success', 'Member deleted successfully.');
    }
}
