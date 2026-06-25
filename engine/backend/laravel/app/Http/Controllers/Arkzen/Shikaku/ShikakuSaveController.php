<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — ShikakuSaveController
// Tatemono: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T07:06:04.774178Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Shikaku;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\Shikaku\ShikakuSave;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ShikakuSaveController extends Controller
{
    /**
     * Save current frame/layer state as JSON blob
     */
    public function save(Request $request): JsonResponse
    {
        // Custom endpoint: save
        // Add @arkzen:endpoint:save ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }

    /**
     * Load most recent save for a project
     */
    public function latest(Request $request): JsonResponse
    {
        // Custom endpoint: latest
        // Add @arkzen:endpoint:latest ... :end block to your tatemono to inject logic.
        return response()->json(['message' => 'Not implemented']);
    }
}
