<?php

// ============================================================
// ARKZEN GENERATED REQUEST — UploadedFileStoreRequest
// Tatemono: upload-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-24T15:02:03.945748Z
// ============================================================

namespace App\Http\Requests\Arkzen\UploadTest;

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
