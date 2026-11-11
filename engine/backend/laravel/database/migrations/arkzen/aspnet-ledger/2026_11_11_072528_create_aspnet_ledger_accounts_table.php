<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — aspnet_ledger_accounts
// Connection: aspnet_ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:28.019289Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'aspnet_ledger';

    public function up(): void
    {
        Schema::connection('aspnet_ledger')->create('aspnet_ledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('owner', 120);
            $table->decimal('balance', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('aspnet_ledger')->dropIfExists('aspnet_ledger_accounts');
    }
};
