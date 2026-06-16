<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — CommandRunController
// Tatemono: scheduler-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T13:13:41.511256Z
// ============================================================

namespace App\Http\Controllers\Arkzen\SchedulerTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\SchedulerTest\CommandRun;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CommandRunController extends Controller
{
    /**
     * Get all command run records
     */
    public function index(Request $request): JsonResponse
    {
        $query = CommandRun::query();


        $perPage = $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json($results);
    }

    /**
     * Execute a command and record the result
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'command' => 'required|string',
            'triggered_by' => 'sometimes|string'
        ]);

        $commandName = $validated['command'];
        $triggeredBy = $validated['triggered_by'] ?? 'manual';

        // Map command name to signature (extracted from tatemono)
        $signatures = [
            'cleanup-temp' => 'scheduler-test:cleanup-temp',
            'generate-report' => 'scheduler-test:generate-report',
            'ping-health' => 'scheduler-test:ping-health',
            'sync-data' => 'scheduler-test:sync-data',
        ];

        $signature = $signatures[$commandName] ?? null;
        if (!$signature) {
            return response()->json(['message' => 'Invalid command'], 400);
        }

        $start = microtime(true);
        
        try {
            $exitCode = \Artisan::call($signature);
            $output = \Artisan::output();
        } catch (\Exception $e) {
            $exitCode = 1;
            $output = $e->getMessage();
        }

        $durationMs = (int) ((microtime(true) - $start) * 1000);

        $commandRun = CommandRun::create([
            'command_name' => $commandName,
            'signature' => $signature,
            'exit_code' => $exitCode,
            'output' => $output,
            'triggered_by' => $triggeredBy,
            'duration_ms' => $durationMs,
        ]);

        return response()->json($commandRun, 201);
    }

    /**
     * Clear all run records
     */
    public function destroy(CommandRun $commandRun): JsonResponse
    {
        $commandRun->delete();

        return response()->json(['message' => 'Runs cleared']);
    }
}
