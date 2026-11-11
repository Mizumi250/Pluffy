<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — spring_ledger_accounts
// Connection: spring_ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:27:04.614945Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'spring_ledger';

    public function up(): void
    {
        Schema::connection('spring_ledger')->create('spring_ledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->decimal('balance', 14, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('spring_ledger')->dropIfExists('spring_ledger_accounts');
    }
};
