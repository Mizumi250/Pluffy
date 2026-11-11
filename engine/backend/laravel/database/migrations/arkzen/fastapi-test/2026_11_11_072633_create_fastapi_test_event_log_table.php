<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — fastapi_test_event_log
// Connection: fastapi_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:33.268523Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'fastapi_test';

    public function up(): void
    {
        Schema::connection('fastapi_test')->create('fastapi_test_event_log', function (Blueprint $table) {
            $table->string('event_name');
            $table->string('listener');
            $table->text('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('fastapi_test')->dropIfExists('fastapi_test_event_log');
    }
};
