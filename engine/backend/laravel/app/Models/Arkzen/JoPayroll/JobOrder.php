<?php

// ============================================================
// ARKZEN GENERATED MODEL — JobOrder
// Tatemono: jo-payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T03:17:37.428827Z
// ============================================================

namespace App\Models\Arkzen\JoPayroll;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobOrder extends Model
{
    use HasFactory;

    protected $connection = 'jo_payroll';

    protected $table = 'jo_payroll_job_orders';

    protected $fillable = [
        'jor_number',
        'name_of_jo',
        'job_title',
        'funding',
        'basic_pay',
        'disbursement_type',
        'jor_pyrl_group',
        'hdmf_no',
        'cash_card',
        'cash_card_number',
        'sss_number',
        'sss_amount',
        'calamity_loan',
        'hdmf_mpl',
        'hdmf_premium',
        'last_name',
        'first_name',
        'middle_name',
        'appointment_date',
        'appointment_order',
        'status'
    ];

    protected $casts = [
        'id' => 'integer',
        'jor_number' => 'integer',
        'basic_pay' => 'decimal:2',
        'sss_amount' => 'decimal:2',
        'calamity_loan' => 'decimal:2',
        'hdmf_mpl' => 'decimal:2',
        'hdmf_premium' => 'decimal:2',
        'appointment_date' => 'date',
        'appointment_order' => 'integer'
    ];


}
