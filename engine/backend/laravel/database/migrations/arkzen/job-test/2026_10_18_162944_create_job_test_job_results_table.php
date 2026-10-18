<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — job_test_job_results
// Connection: job_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:29:44.893599Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'job_test';

    public function up(): void
    {
        Schema::connection('job_test')->create('job_test_job_results', function (Blueprint $table) {
            $table->id();
            $table->string('job_name', 100);
            $table->string('status', 50);
            $table->text('result')->nullable();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('job_test')->dropIfExists('job_test_job_results');
    }
};
