<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — spring_ledger_transfers
// Connection: spring_ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:27:04.835302Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'spring_ledger';

    public function up(): void
    {
        Schema::connection('spring_ledger')->create('spring_ledger_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_account_id')->constrained('spring_ledger_accounts', 'id')->onDelete('cascade');
            $table->foreignId('to_account_id')->constrained('spring_ledger_accounts', 'id')->onDelete('cascade');
            $table->decimal('amount', 14, 2);
            $table->string('status', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('spring_ledger')->dropIfExists('spring_ledger_transfers');
    }
};
