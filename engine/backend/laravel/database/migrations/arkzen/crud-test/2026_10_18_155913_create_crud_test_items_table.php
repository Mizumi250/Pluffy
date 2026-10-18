<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — crud_test_items
// Connection: crud_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:13.946745Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'crud_test';

    public function up(): void
    {
        Schema::connection('crud_test')->create('crud_test_items', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('status', 50)->default('active');
            $table->integer('priority')->default(0);
            $table->string('tags')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('crud_test')->dropIfExists('crud_test_items');
    }
};
