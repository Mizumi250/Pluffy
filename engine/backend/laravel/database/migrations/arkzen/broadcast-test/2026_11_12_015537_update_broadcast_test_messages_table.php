<?php

// ============================================================
// ARKZEN GENERATED UPDATE MIGRATION — broadcast_test_messages
// Connection: broadcast_test
// Generated: 2026-11-12T01:55:37.777120Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'broadcast_test';

    public function up(): void
    {
        Schema::connection('broadcast_test')->table('broadcast_test_messages', function (Blueprint $table) {
            $table->integer('user_id')->nullable();
        });
    }

    public function down(): void
    {
        // Reverse if needed
    }
};
