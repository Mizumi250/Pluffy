<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — express_test_2_records
// Connection: express_test_2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:29.594261Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'express_test_2';

    public function up(): void
    {
        Schema::connection('express_test_2')->create('express_test_2_records', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable();
            $table->string('title', 255);
            $table->string('status', 30)->default('open');
            $table->integer('priority')->default(1);
            $table->boolean('done')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::connection('express_test_2')->dropIfExists('express_test_2_records');
    }
};
