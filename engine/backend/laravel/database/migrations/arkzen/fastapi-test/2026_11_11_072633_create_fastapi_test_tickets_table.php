<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — fastapi_test_tickets
// Connection: fastapi_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:33.018134Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'fastapi_test';

    public function up(): void
    {
        Schema::connection('fastapi_test')->create('fastapi_test_tickets', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable();
            $table->string('title', 255);
            $table->string('status', 30)->default('open');
            $table->integer('priority')->default(1);
            $table->boolean('done')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('fastapi_test')->dropIfExists('fastapi_test_tickets');
    }
};
