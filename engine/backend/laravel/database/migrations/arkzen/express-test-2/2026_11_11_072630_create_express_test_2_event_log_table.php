<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — express_test_2_event_log
// Connection: express_test_2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:30.742848Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'express_test_2';

    public function up(): void
    {
        Schema::connection('express_test_2')->create('express_test_2_event_log', function (Blueprint $table) {
            $table->string('event_name');
            $table->string('listener');
            $table->text('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('express_test_2')->dropIfExists('express_test_2_event_log');
    }
};
