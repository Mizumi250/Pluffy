<?php

// ============================================================
// ARKZEN GENERATED POLICY — TestRecordPolicy
// Tatemono: express-test-2
// v6.0: Methods may include injected logic from @arkzen:policy:methodName blocks
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.069169Z
// ============================================================

namespace App\Policies\Arkzen\ExpressTest2;

use App\Models\User;
use App\Models\Arkzen\ExpressTest2\TestRecord;
use Illuminate\Auth\Access\HandlesAuthorization;

class TestRecordPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool { return true; }

    public function view(?User $user, TestRecord $testRecord): bool { return true; }

    public function create(?User $user): bool { return true; }

    public function update(?User $user, TestRecord $testRecord): bool
    {
        return ($user?->id === $testRecord->user_id) || ($user?->role === 'admin');
    }

    public function delete(?User $user, TestRecord $testRecord): bool
    {
        return ($user?->id === $testRecord->user_id) || ($user?->role === 'admin');
    }
}
