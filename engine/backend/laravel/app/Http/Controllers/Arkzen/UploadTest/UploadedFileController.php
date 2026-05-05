<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — UploadedFileController
// Tatemono: upload-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-05T15:14:23.217510Z
// ============================================================

namespace App\Http\Controllers\Arkzen\UploadTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\UploadTest\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class UploadedFileController extends Controller
{
    /**
     * List all uploaded files
     */
    public function index(Request $request): JsonResponse
    {
        $records = UploadedFile::latest()->get()->map(function ($file) {
            $file->url = $file->is_image
                ? '/storage/' . ltrim($file->disk_path, '/')
                : null;
            return $file;
        });

        return response()->json(['data' => $records]);
    }

    /**
     * Upload one or more files
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240'
        ]);

        $uploaded = [];

        foreach ($request->file('files', []) as $file) {
            $originalName = $file->getClientOriginalName();
            $storedName   = $file->store('arkzen/' . $this->tatemonoSlug(), 'public');
            $isImage      = str_starts_with($file->getMimeType(), 'image/');

            $record = UploadedFile::create([
                'user_id'       => auth()->id(),
                'original_name' => $originalName,
                'stored_name'   => basename($storedName),
                'mime_type'     => $file->getMimeType(),
                'size_bytes'    => $file->getSize(),
                'disk_path'     => $storedName,
                'is_image'      => $isImage,
            ]);

            if ($isImage) {
                $record->url = '/storage/' . ltrim($storedName, '/');
            }

            $uploaded[] = $record;
        }

        return response()->json(['data' => $uploaded], 201);
    }

    /**
     * Delete a file
     */
    public function destroy(UploadedFile $uploadedFile): JsonResponse
    {
        if (\Storage::disk('public')->exists($uploadedFile->disk_path)) {
            \Storage::disk('public')->delete($uploadedFile->disk_path);
        }

        $uploadedFile->delete();

        return response()->json(['message' => 'File deleted']);
    }

    /**
     * Get public URL or download for a file
     */
    public function fileUrl(UploadedFile $uploadedFile): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        $fullPath = \Storage::disk('public')->path($uploadedFile->disk_path);

        if (!\Storage::disk('public')->exists($uploadedFile->disk_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->download($fullPath, $uploadedFile->original_name, [
            'Content-Type' => $uploadedFile->mime_type,
        ]);
    }

    // ─────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────

    private function tatemonoSlug(): string
    {
        // Derives the tatemono slug from the Arkzen namespace segment
        // e.g. App\Http\Controllers\Arkzen\UploadTest\UploadedFileController → upload-test
        $parts   = explode('\\', static::class);
        $idx     = array_search('Arkzen', $parts);
        $segment = ($idx !== false && isset($parts[$idx + 1])) ? $parts[$idx + 1] : class_basename(static::class);
        $words   = preg_split('/(?=[A-Z])/', $segment, -1, PREG_SPLIT_NO_EMPTY);
        return strtolower(implode('-', $words));
    }
}
