<?php

// ============================================================
// ARKZEN GENERATED REQUEST — MemberUpdateRequest
// Tatemono: church-community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T07:52:54.043039Z
// ============================================================

namespace App\Http\Requests\Arkzen\ChurchCommunity;

use Illuminate\Foundation\Http\FormRequest;

class MemberUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:pastor,elder,deacon,leader,member',
            'email' => 'sometimes|email',
            'bio' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function messages(): array { return []; }
}
