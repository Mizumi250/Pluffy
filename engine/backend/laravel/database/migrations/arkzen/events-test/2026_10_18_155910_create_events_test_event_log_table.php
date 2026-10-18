<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — events_test_event_log
// Connection: events_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:10.505455Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'events_test';

    public function up(): void
    {
        Schema::connection('events_test')->create('events_test_event_log', function (Blueprint $table) {
            $table->id();
            $table->string('event_name', 255);
            $table->string('listener_name', 255);
            $table->string('status', 50)->default('completed');
            $table->text('payload')->nullable();
            $table->integer('duration_ms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('events_test')->dropIfExists('events_test_event_log');
    }
};
