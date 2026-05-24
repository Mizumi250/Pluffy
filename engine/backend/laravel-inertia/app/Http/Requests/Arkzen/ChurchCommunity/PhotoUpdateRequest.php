<?php

// ============================================================
// ARKZEN GENERATED REQUEST — PhotoUpdateRequest
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-24T01:58:06.314698Z
// ============================================================

namespace App\Http\Requests\Arkzen\ChurchCommunity;

use Illuminate\Foundation\Http\FormRequest;

class PhotoUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'caption' => 'sometimes|string|max:500',
            'tags' => 'sometimes|array',
        ];
    }

    public function messages(): array { return []; }
}
