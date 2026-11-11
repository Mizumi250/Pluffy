<?php

// ============================================================
// ARKZEN GENERATED POLICY — TicketPolicy
// Tatemono: express-test
// v6.0: Methods may include injected logic from @arkzen:policy:methodName blocks
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:26.929158Z
// ============================================================

namespace App\Policies\Arkzen\ExpressTest;

use App\Models\User;
use App\Models\Arkzen\ExpressTest\Ticket;
use Illuminate\Auth\Access\HandlesAuthorization;

class TicketPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool { return true; }

    public function view(?User $user, Ticket $ticket): bool { return true; }

    public function create(?User $user): bool { return true; }

    public function update(?User $user, Ticket $ticket): bool
    {
        return ($user?->id === $ticket->user_id) || ($user?->role === 'admin');
    }

    public function delete(?User $user, Ticket $ticket): bool
    {
        return ($user?->id === $ticket->user_id) || ($user?->role === 'admin');
    }
}
