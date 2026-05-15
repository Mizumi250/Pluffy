<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — certflow_scans
// Connection: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-15T04:47:54.000537Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'certflow';

    public function up(): void
    {
        Schema::connection('certflow')->create('certflow_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('certflow_submissions')->onDelete('cascade');
            $table->dateTime('scanned_at');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('certflow')->dropIfExists('certflow_scans');
    }
};
