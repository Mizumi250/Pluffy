<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — middleware_test_ping_logs
// Connection: middleware_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:30:11.858179Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'middleware_test';

    public function up(): void
    {
        Schema::connection('middleware_test')->create('middleware_test_ping_logs', function (Blueprint $table) {
            $table->string('message');
            $table->boolean('headers_ok')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('middleware_test')->dropIfExists('middleware_test_ping_logs');
    }
};
