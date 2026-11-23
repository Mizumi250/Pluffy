<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — pay_lab_orders
// Connection: pay_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:27:55.706808Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pay_lab';

    public function up(): void
    {
        Schema::connection('pay_lab')->create('pay_lab_orders', function (Blueprint $table) {
            $table->string('public_id', 64)->unique();
            $table->string('status', 12)->default('pending');
            $table->integer('total_cents');
            $table->string('currency', 3);
            $table->string('idempotency_key', 64)->nullable()->unique();
            $table->string('fingerprint', 400);
            $table->string('provider_session_id', 80)->nullable();
            $table->string('checkout_url', 400)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('pay_lab')->dropIfExists('pay_lab_orders');
    }
};
