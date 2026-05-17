<?php

// ============================================================
// ARKZEN GENERATED ROUTES — upload-test [Inertia/Web]
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T06:40:01.536864Z
// Resources: UploadedFile
// Custom controllers: 
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Arkzen\UploadTest\UploadedFileController;

// ── UploadedFile ─────────────────────────────
Route::middleware(['web'])
    ->prefix('/api/upload-test')
    ->group(function () {

        // List all uploaded files
        Route::get('/files', [UploadedFileController::class, 'index']);

        // Upload one or more files
        Route::post('/files', [UploadedFileController::class, 'store']);

        // Delete a file
        Route::delete('/files/{uploadedFile}', [UploadedFileController::class, 'destroy']);

        // Get public URL or download for a file
        Route::get('/files/{uploadedFile}/url', [UploadedFileController::class, 'fileUrl']);

    });
