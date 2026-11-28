<?php

// ============================================================
// ARKZEN GENERATED ROUTES — ollama-studio
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:14:37.164810Z
// Resources: Assistant
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\OllamaStudio\AssistantController;

// ── Assistant ─────────────────────────────
Route::middleware(['api'])
    ->prefix('/api/ollama-studio')
    ->group(function () {

        // Generate a response from the configured OpenAI-compatible API
        Route::post('/chat', [AssistantController::class, 'chat']);

    });
