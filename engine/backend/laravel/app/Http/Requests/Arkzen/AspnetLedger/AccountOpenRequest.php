<?php

// ============================================================
// ARKZEN GENERATED REQUEST — AccountOpenRequest
// Tatemono: aspnet-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T12:30:08.347327Z
// ============================================================

namespace App\Http\Requests\Arkzen\AspnetLedger;

use Illuminate\Foundation\Http\FormRequest;

class AccountOpenRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'owner' => 'required|string|max:120',
            'balance' => 'sometimes|numeric|min:0',
        ];
    }

    public function messages(): array { return []; }
}
