<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — aspnet_test_checks
// Connection: aspnet_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:30.513454Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'aspnet_test';

    public function up(): void
    {
        Schema::connection('aspnet_test')->create('aspnet_test_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable();
            $table->string('name', 120);
            $table->string('status', 24)->default('pending');
            $table->integer('priority')->default(1);
            $table->boolean('done')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('aspnet_test')->dropIfExists('aspnet_test_checks');
    }
};
