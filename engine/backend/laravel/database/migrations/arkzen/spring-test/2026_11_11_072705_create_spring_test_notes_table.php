<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — spring_test_notes
// Connection: spring_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:27:05.526292Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'spring_test';

    public function up(): void
    {
        Schema::connection('spring_test')->create('spring_test_notes', function (Blueprint $table) {
            $table->id();
            $table->string('title', 160);
            $table->text('body')->nullable();
            $table->boolean('pinned')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('spring_test')->dropIfExists('spring_test_notes');
    }
};
