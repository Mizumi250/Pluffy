<?php

// ============================================================
// ARKZEN GENERATED REQUEST — BookingStoreRequest
// Tatemono: a2ui-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-25T01:29:04.760700Z
// ============================================================

namespace App\Http\Requests\Arkzen\A2uiLab;

use Illuminate\Foundation\Http\FormRequest;

class BookingStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:80',
            'service' => 'required|string|max:80',
            'day' => 'required|string|max:10',
            'slot' => 'required|string|max:5',
        ];
    }

    public function messages(): array { return []; }
}
