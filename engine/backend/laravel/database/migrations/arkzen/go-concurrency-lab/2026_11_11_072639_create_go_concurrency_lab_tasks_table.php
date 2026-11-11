<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — go_concurrency_lab_tasks
// Connection: go_concurrency_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:39.125693Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'go_concurrency_lab';

    public function up(): void
    {
        Schema::connection('go_concurrency_lab')->create('go_concurrency_lab_tasks', function (Blueprint $table) {
            $table->string('title', 120);
            $table->integer('priority')->default(3);
            $table->string('status')->default('queued');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('go_concurrency_lab')->dropIfExists('go_concurrency_lab_tasks');
    }
};
