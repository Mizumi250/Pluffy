<?php

// ============================================================
// ARKZEN GENERATED REQUEST — ShikakuSaveSaveRequest
// Tatemono: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:53.981076Z
// ============================================================

namespace App\Http\Requests\Arkzen\Shikaku;

use Illuminate\Foundation\Http\FormRequest;

class ShikakuSaveSaveRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'frames_json' => 'required|string',
        ];
    }

    public function messages(): array { return []; }
}
