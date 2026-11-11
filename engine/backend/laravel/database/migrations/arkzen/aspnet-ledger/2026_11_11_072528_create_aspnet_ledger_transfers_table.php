<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — aspnet_ledger_transfers
// Connection: aspnet_ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:28.529227Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'aspnet_ledger';

    public function up(): void
    {
        Schema::connection('aspnet_ledger')->create('aspnet_ledger_transfers', function (Blueprint $table) {
            $table->id();
            $table->integer('from_account_id');
            $table->integer('to_account_id');
            $table->decimal('amount', 12, 2);
            $table->string('status', 20)->default('completed');
            $table->string('memo', 140)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('aspnet_ledger')->dropIfExists('aspnet_ledger_transfers');
    }
};
