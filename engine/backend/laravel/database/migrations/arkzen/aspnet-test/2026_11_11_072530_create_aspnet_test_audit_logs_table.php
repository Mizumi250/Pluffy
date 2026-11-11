<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — aspnet_test_audit_logs
// Connection: aspnet_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:30.987325Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'aspnet_test';

    public function up(): void
    {
        Schema::connection('aspnet_test')->create('aspnet_test_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action', 60);
            $table->integer('check_id')->nullable();
            $table->string('actor', 120)->nullable();
            $table->text('detail')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('aspnet_test')->dropIfExists('aspnet_test_audit_logs');
    }
};
