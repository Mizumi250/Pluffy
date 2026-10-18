<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — broadcast_test_messages
// Connection: broadcast_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:29:37.096704Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'broadcast_test';

    public function up(): void
    {
        Schema::connection('broadcast_test')->create('broadcast_test_messages', function (Blueprint $table) {
            $table->id();
            $table->string('content', 500);
            $table->string('channel_type', 50)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('broadcast_test')->dropIfExists('broadcast_test_messages');
    }
};
