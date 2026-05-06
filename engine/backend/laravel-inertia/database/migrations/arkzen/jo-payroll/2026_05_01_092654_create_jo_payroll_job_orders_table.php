<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — jo_payroll_job_orders
// Connection: jo_payroll
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-01T09:26:54.751572Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'jo_payroll';

    public function up(): void
    {
        Schema::connection('jo_payroll')->create('jo_payroll_job_orders', function (Blueprint $table) {
            $table->id();
            $table->integer('jor_number');
            $table->string('name_of_jo', 255);
            $table->string('job_title', 255)->default('LABORER');
            $table->string('funding', 255);
            $table->decimal('basic_pay', 10, 2)->default(346);
            $table->string('disbursement_type', 10)->default('CASH');
            $table->string('jor_pyrl_group', 100)->nullable();
            $table->string('hdmf_no', 50)->nullable();
            $table->string('cash_card', 50)->nullable();
            $table->string('cash_card_number', 50)->nullable();
            $table->string('sss_number', 30)->nullable();
            $table->decimal('sss_amount', 10, 2)->nullable()->default(0);
            $table->decimal('calamity_loan', 10, 2)->nullable()->default(0);
            $table->decimal('hdmf_mpl', 10, 2)->nullable()->default(0);
            $table->decimal('hdmf_premium', 10, 2)->nullable()->default(0);
            $table->string('last_name', 100)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('middle_name', 100)->nullable();
            $table->date('appointment_date')->nullable();
            $table->integer('appointment_order')->nullable()->default(0);
            $table->string('status', 20)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('jo_payroll')->dropIfExists('jo_payroll_job_orders');
    }
};
