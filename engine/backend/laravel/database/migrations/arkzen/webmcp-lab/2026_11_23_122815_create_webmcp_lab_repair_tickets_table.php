<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — webmcp_lab_repair_tickets
// Connection: webmcp_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:28:15.832548Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'webmcp_lab';

    public function up(): void
    {
        Schema::connection('webmcp_lab')->create('webmcp_lab_repair_tickets', function (Blueprint $table) {
            $table->string('code', 12);
            $table->string('customer', 80);
            $table->string('bike', 80);
            $table->string('status', 20)->default('waiting');
            $table->string('note', 160)->nullable();
            $table->string('ready_by', 40)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('webmcp_lab')->dropIfExists('webmcp_lab_repair_tickets');
    }
};
