<?php

// ============================================================
// ARKZEN GENERATED — Lynx SSE bridge for express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T12:30:18.113706Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest2;

use App\Http\Controllers\Arkzen\Support\LynxSseBridgeController;
use App\Models\Arkzen\ExpressTest2\SendLog;

class SseController extends LynxSseBridgeController
{
    protected string $model = SendLog::class;

    protected array $eventNameMap = [
        'public' => 'express-test-2.record-created',
    ];
}
