<?php

// ============================================================
// ARKZEN GENERATED REQUEST — UploadedFileStoreRequest
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:44.571523Z
// ============================================================

namespace App\Http\Requests\Arkzen\ExpressTest2;

use Illuminate\Foundation\Http\FormRequest;

class UploadedFileStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'files' => 'required|array',
            'files.*' => 'file|max:10240',
        ];
    }

    public function messages(): array { return []; }
}
