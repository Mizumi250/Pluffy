<?php

// ============================================================
// ARKZEN GENERATED REQUEST — InventoryStoreRequest
// Tatemono: inventory-management
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-09T06:27:33.127497Z
// ============================================================

namespace App\Http\Requests\Arkzen\InventoryManagement;

use Illuminate\Foundation\Http\FormRequest;

class InventoryStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:inventory_management.inventory_management_inventories',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ];
    }

    public function messages(): array { return []; }
}
