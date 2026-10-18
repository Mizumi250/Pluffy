<?php

// ============================================================
// ARKZEN GENERATED — Lynx SSE bridge for broadcast-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T17:14:18.941355Z
// ============================================================

namespace App\Http\Controllers\Arkzen\BroadcastTest;

use App\Http\Controllers\Arkzen\Support\LynxSseBridgeController;
use App\Models\Arkzen\BroadcastTest\Message;

class SseController extends LynxSseBridgeController
{
    protected string $model = Message::class;

    protected array $eventNameMap = [
        'public' => 'broadcast-test.message-sent-public',
        'private' => 'broadcast-test.message-sent-private',
        'presence' => 'broadcast-test.message-sent-presence',
    ];
}
