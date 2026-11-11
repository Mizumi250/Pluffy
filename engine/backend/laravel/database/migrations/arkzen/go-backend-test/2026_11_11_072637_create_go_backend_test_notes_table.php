<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — go_backend_test_notes
// Connection: go_backend_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:37.311608Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'go_backend_test';

    public function up(): void
    {
        Schema::connection('go_backend_test')->create('go_backend_test_notes', function (Blueprint $table) {
            $table->string('title', 120);
            $table->text('body')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('go_backend_test')->dropIfExists('go_backend_test_notes');
    }
};
