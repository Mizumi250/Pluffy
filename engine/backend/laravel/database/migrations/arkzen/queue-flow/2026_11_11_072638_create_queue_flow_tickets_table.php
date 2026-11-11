<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — queue_flow_tickets
// Connection: queue_flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:38.408952Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'queue_flow';

    public function up(): void
    {
        Schema::connection('queue_flow')->create('queue_flow_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('queue_id')->constrained('queue_flow_queues', 'id')->onDelete('cascade');
            $table->string('ticket_number');
            $table->string('customer_name')->nullable();
            $table->string('status')->default('waiting');
            $table->integer('position')->default(0);
            $table->dateTime('called_at')->nullable();
            $table->dateTime('served_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('queue_flow')->dropIfExists('queue_flow_tickets');
    }
};
