<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — scheduler_test_command_runs
// Connection: scheduler_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:29:58.425771Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'scheduler_test';

    public function up(): void
    {
        Schema::connection('scheduler_test')->create('scheduler_test_command_runs', function (Blueprint $table) {
            $table->id();
            $table->string('command_name', 100);
            $table->string('signature', 150);
            $table->integer('exit_code')->default(0);
            $table->text('output')->nullable();
            $table->string('triggered_by', 50)->default('manual');
            $table->integer('duration_ms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('scheduler_test')->dropIfExists('scheduler_test_command_runs');
    }
};
