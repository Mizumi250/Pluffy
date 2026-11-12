<?php

// ============================================================
// ARKZEN GENERATED POLICY — TicketPolicy
// Tatemono: fastapi-test
// v6.0: Methods may include injected logic from @arkzen:policy:methodName blocks
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:46.221689Z
// ============================================================

namespace App\Policies\Arkzen\FastapiTest;

use App\Models\User;
use App\Models\Arkzen\FastapiTest\Ticket;
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
