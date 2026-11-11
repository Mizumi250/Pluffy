<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — UploadedFileController
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:31.195829Z
// ============================================================

namespace App\Http\Controllers\Arkzen\ExpressTest2;

use App\Http\Controllers\Controller;
use App\Models\Arkzen\ExpressTest2\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class UploadedFileController extends Controller
{
    /**
     * List uploaded files
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
     * Upload files
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
     * Delete an uploaded file
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
     * Download an uploaded file
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
