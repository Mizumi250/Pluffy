<?php

// ============================================================
// ARKZEN GENERATED REQUEST — UiReleaseStoreRequest
// Tatemono: mobile-sdui
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:59.356641Z
// ============================================================

namespace App\Http\Requests\Arkzen\MobileSdui;

use Illuminate\Foundation\Http\FormRequest;

class UiReleaseStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'configuration' => 'required|string|max:10000',
            'activate_at' => 'required|string|max:40',
        ];
    }

    public function messages(): array { return []; }
}
