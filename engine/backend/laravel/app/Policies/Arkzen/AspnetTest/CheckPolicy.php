<?php

// ============================================================
// ARKZEN GENERATED POLICY — CheckPolicy
// Tatemono: aspnet-test
// v6.0: Methods may include injected logic from @arkzen:policy:methodName blocks
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:33.497180Z
// ============================================================

namespace App\Policies\Arkzen\AspnetTest;

use App\Models\User;
use App\Models\Arkzen\AspnetTest\Check;
use Illuminate\Auth\Access\HandlesAuthorization;

class CheckPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool { return true; }

    public function view(?User $user, Check $check): bool { return true; }

    public function create(?User $user): bool { return true; }

    public function update(?User $user, Check $check): bool
    {
        return ($user?->id === $check->user_id) || ($user?->role === 'admin');
    }

    public function delete(?User $user, Check $check): bool
    {
        return ($user?->id === $check->user_id) || ($user?->role === 'admin');
    }
}
