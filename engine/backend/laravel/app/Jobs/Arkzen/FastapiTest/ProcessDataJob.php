<?php

// ============================================================
// ARKZEN GENERATED JOB — ProcessDataJob
// Tatemono: fastapi-test
// Queue: default | Tries: 2 | Timeout: 20s
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:46.549377Z
// ============================================================

namespace App\Jobs\Arkzen\FastapiTest;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 20;

    public function __construct(
        public readonly array $data = []
    ) {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        Log::info('[Arkzen Job] Running: FastapiTest\\ProcessDataJob', $this->data);

        // TODO: implement job logic for process-data
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('[Arkzen Job] Failed: FastapiTest\\ProcessDataJob', [
            'error' => $exception->getMessage(),
            'data'  => $this->data,
        ]);
    }
}
