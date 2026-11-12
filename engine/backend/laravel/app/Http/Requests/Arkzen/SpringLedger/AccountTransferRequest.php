<?php

// ============================================================
// ARKZEN GENERATED REQUEST — AccountTransferRequest
// Tatemono: spring-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:07.360747Z
// ============================================================

namespace App\Http\Requests\Arkzen\SpringLedger;

use Illuminate\Foundation\Http\FormRequest;

class AccountTransferRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'from_account_id' => 'required|integer',
            'to_account_id' => 'required|integer',
            'amount' => 'required|numeric|min:0.01',
        ];
    }

    public function messages(): array { return []; }
}
