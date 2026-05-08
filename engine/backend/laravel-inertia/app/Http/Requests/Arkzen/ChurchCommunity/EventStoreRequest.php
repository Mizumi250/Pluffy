<?php

// ============================================================
// ARKZEN GENERATED REQUEST — EventStoreRequest
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-08T01:35:29.128713Z
// ============================================================

namespace App\Http\Requests\Arkzen\ChurchCommunity;

use Illuminate\Foundation\Http\FormRequest;

class EventStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'sometimes|string',
            'event_date' => 'required|date',
            'is_members_only' => 'sometimes|boolean',
        ];
    }

    public function messages(): array { return []; }
}
