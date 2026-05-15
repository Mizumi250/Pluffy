<?php

// ============================================================
// ARKZEN GENERATED REQUEST — PhotoStoreRequest
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-15T01:28:19.422000Z
// ============================================================

namespace App\Http\Requests\Arkzen\ChurchCommunity;

use Illuminate\Foundation\Http\FormRequest;

class PhotoStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'event_id' => 'required|integer|exists:church_community.church_community_events,id',
            'url' => 'required|string|max:500',
            'caption' => 'sometimes|string|max:500',
            'file_name' => 'required|string|max:255',
            'file_size' => 'sometimes|integer',
            'tags' => 'sometimes|array',
        ];
    }

    public function messages(): array { return []; }
}
