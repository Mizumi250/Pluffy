<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — body_endpoint_handler_probe_results
// Connection: body_endpoint_handler
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:02.816487Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'body_endpoint_handler';

    public function up(): void
    {
        Schema::connection('body_endpoint_handler')->create('body_endpoint_handler_probe_results', function (Blueprint $table) {
            $table->id();
            $table->string('source', 50);
            $table->string('probe', 100);
            $table->text('payload')->nullable();
            $table->text('result')->nullable();
            $table->boolean('ok')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('body_endpoint_handler')->dropIfExists('body_endpoint_handler_probe_results');
    }
};
