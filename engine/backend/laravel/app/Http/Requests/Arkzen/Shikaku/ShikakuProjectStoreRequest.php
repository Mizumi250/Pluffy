<?php

// ============================================================
// ARKZEN GENERATED REQUEST — ShikakuProjectStoreRequest
// Tatemono: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T01:17:01.537776Z
// ============================================================

namespace App\Http\Requests\Arkzen\Shikaku;

use Illuminate\Foundation\Http\FormRequest;

class ShikakuProjectStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'width' => 'required|integer|in:8,16,32,64,128',
            'height' => 'required|integer|in:8,16,32,64,128',
        ];
    }

    public function messages(): array { return []; }
}
