<?php

// ============================================================
// ARKZEN GENERATED REQUEST — AccountTransferRequest
// Tatemono: aspnet-ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:28.645434Z
// ============================================================

namespace App\Http\Requests\Arkzen\AspnetLedger;

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
            'memo' => 'sometimes|string|max:140',
        ];
    }

    public function messages(): array { return []; }
}
