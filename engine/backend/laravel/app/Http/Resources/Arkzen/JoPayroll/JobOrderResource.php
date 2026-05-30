<?php

// ============================================================
// ARKZEN GENERATED RESOURCE — JobOrderResource
// Tatemono: jo-payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-30T12:11:29.674370Z
// ============================================================

namespace App\Http\Resources\Arkzen\JoPayroll;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'jor_number' => $this->jor_number,
            'name_of_jo' => $this->name_of_jo,
            'job_title' => $this->job_title,
            'funding' => $this->funding,
            'basic_pay' => $this->basic_pay,
            'disbursement_type' => $this->disbursement_type,
            'jor_pyrl_group' => $this->jor_pyrl_group,
            'hdmf_no' => $this->hdmf_no,
            'cash_card' => $this->cash_card,
            'cash_card_number' => $this->cash_card_number,
            'sss_number' => $this->sss_number,
            'sss_amount' => $this->sss_amount,
            'calamity_loan' => $this->calamity_loan,
            'hdmf_mpl' => $this->hdmf_mpl,
            'hdmf_premium' => $this->hdmf_premium,
            'last_name' => $this->last_name,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'appointment_date' => $this->appointment_date,
            'appointment_order' => $this->appointment_order,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
