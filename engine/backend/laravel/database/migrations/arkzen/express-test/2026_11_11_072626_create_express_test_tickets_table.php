<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — express_test_tickets
// Connection: express_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:26.055937Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'express_test';

    public function up(): void
    {
        Schema::connection('express_test')->create('express_test_tickets', function (Blueprint $table) {
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
        Schema::connection('express_test')->dropIfExists('express_test_tickets');
    }
};
