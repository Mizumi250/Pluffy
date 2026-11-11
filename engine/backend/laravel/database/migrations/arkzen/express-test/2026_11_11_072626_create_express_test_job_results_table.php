<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — express_test_job_results
// Connection: express_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:26.819146Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'express_test';

    public function up(): void
    {
        Schema::connection('express_test')->create('express_test_job_results', function (Blueprint $table) {
            $table->string('job_name');
            $table->string('status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('express_test')->dropIfExists('express_test_job_results');
    }
};
