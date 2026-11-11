<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — express_test_2_command_runs
// Connection: express_test_2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:30.524947Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'express_test_2';

    public function up(): void
    {
        Schema::connection('express_test_2')->create('express_test_2_command_runs', function (Blueprint $table) {
            $table->string('command_name');
            $table->string('signature');
            $table->integer('exit_code')->default(0);
            $table->text('output')->nullable();
            $table->string('triggered_by')->default('manual');
            $table->integer('duration_ms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('express_test_2')->dropIfExists('express_test_2_command_runs');
    }
};
