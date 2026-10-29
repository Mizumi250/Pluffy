<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — MailLogController
// Tatemono: mail-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:09:02.103936Z
// ============================================================

namespace App\Http\Controllers\Arkzen\MailTest;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\MailTest\MailLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MailLogController extends Controller
{
    /**
     * Get all mail logs
     */
    public function index(Request $request): JsonResponse
    {
        $query = MailLog::query();


        $results = $query->orderBy('created_at', 'desc')->get();

        return response()->json($results);
    }

    /**
     * Send an email
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mail' => 'required|string',
            'to' => 'required|email',
            'data' => 'array'
        ]);

        $user = $request->user('sanctum');

        $mailKey = $validated['mail'];
        $className = \Illuminate\Support\Str::studly(str_replace('-', '_', $mailKey)) . 'Mail';
        $fullClass = "\\App\\Mail\\Arkzen\\MailTest\\" . $className;

        if (!class_exists($fullClass)) {
            throw new \InvalidArgumentException('Unknown mail type: ' . $mailKey);
        }

        \Mail::to($validated['to'])->send(new $fullClass( ...array_values($validated['data'] ?? []) ));

        $mailLog = MailLog::create([
            'user_id'   => $user?->id,
            'to_email'  => $validated['to'],
            'subject'   => $fullClass::$subject ?? $mailKey,
            'mail_class'=> $fullClass,
            'status'    => 'sent',
        ]);

        return response()->json($mailLog, 201);
    }
}
