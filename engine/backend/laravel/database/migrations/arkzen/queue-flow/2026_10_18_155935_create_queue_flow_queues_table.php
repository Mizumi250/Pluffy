<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — queue_flow_queues
// Connection: queue_flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:35.792700Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'queue_flow';

    public function up(): void
    {
        Schema::connection('queue_flow')->create('queue_flow_queues', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('prefix', 5)->default('Q');
            $table->boolean('is_active')->default(true);
            $table->integer('avg_wait_minutes')->default(5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('queue_flow')->dropIfExists('queue_flow_queues');
    }
};
