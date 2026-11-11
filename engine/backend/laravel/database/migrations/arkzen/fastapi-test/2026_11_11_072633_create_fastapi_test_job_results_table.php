<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — fastapi_test_job_results
// Connection: fastapi_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:33.354580Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'fastapi_test';

    public function up(): void
    {
        Schema::connection('fastapi_test')->create('fastapi_test_job_results', function (Blueprint $table) {
            $table->string('job_name');
            $table->string('status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('fastapi_test')->dropIfExists('fastapi_test_job_results');
    }
};
