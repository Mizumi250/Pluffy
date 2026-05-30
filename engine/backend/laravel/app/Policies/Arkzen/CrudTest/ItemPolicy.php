<?php

// ============================================================
// ARKZEN GENERATED POLICY — ItemPolicy
// Tatemono: crud-test
// v6.0: Methods may include injected logic from @arkzen:policy:methodName blocks
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T14:06:47.436509Z
// ============================================================

namespace App\Policies\Arkzen\CrudTest;

use App\Models\User;
use App\Models\Arkzen\CrudTest\Item;
use Illuminate\Auth\Access\HandlesAuthorization;

class ItemPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool { return true; }

    public function view(?User $user, Item $item): bool { return true; }

    public function create(?User $user): bool { return true; }

    public function update(?User $user, Item $item): bool
    {
        // Prevent updates to archived items
        if ($item->status === 'archived') {
            return false;
        }
        
        // Only allow if user is authenticated (in a real app, check ownership)
        return true;
    }

    public function delete(?User $user, Item $item): bool
    {
        // Prevent deletion of archived items (must restore first)
        if ($item->status === 'archived') {
            return false;
        }
        
        return true;
    }
}
