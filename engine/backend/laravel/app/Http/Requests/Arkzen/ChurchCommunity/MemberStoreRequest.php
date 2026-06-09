<?php

// ============================================================
// ARKZEN GENERATED REQUEST — MemberStoreRequest
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-09T11:29:49.614463Z
// ============================================================

namespace App\Http\Requests\Arkzen\ChurchCommunity;

use Illuminate\Foundation\Http\FormRequest;

class MemberStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'role' => 'required|in:pastor,elder,deacon,leader,member',
            'email' => 'sometimes|email|max:255',
            'bio' => 'sometimes|string',
            'joined_at' => 'sometimes|date',
        ];
    }

    public function messages(): array { return []; }
}
