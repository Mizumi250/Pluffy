<?php

namespace App\Http\Controllers\Arkzen\UploadTest;

use Illuminate\Routing\Controller;
use App\Models\Arkzen\UploadTest\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UploadedFileController extends Controller
{
    /**
     * List all uploaded files
     */
    public function index(Request $request): Response
    {
        $query = UploadedFile::query();


        $perPage = $request->get('per_page', 15);
        $items   = $query->paginate($perPage);

        return Inertia::render('UploadTest/Index', [
            'items'   => $items,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Upload one or more files
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240',
        ]);

        $uploadedFile = UploadedFile::create($validated);

        return redirect()->back()->with('success', 'UploadedFile created successfully.');
    }

    /**
     * Delete a file
     */
    public function destroy(UploadedFile $uploadedFile): RedirectResponse
    {
        $uploadedFile->delete();

        return redirect()->back()->with('success', 'UploadedFile deleted successfully.');
    }

    /**
     * Get public URL or download for a file
     */
    public function fileUrl(Request $request): Response
    {
        return Inertia::render('fileUrl', []);
    }
}
