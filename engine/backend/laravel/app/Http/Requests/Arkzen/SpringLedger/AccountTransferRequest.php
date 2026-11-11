<?php

// ============================================================
// ARKZEN GENERATED REQUEST — AccountTransferRequest
// Tatemono: spring-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:27:04.930534Z
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
