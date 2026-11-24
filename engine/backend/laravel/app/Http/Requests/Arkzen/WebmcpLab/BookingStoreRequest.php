<?php

// ============================================================
// ARKZEN GENERATED REQUEST — BookingStoreRequest
// Tatemono: webmcp-lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T12:30:40.199898Z
// ============================================================

namespace App\Http\Requests\Arkzen\WebmcpLab;

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
