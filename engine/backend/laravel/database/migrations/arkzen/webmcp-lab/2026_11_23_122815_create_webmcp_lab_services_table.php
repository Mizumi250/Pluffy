<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — webmcp_lab_services
// Connection: webmcp_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:28:15.500826Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'webmcp_lab';

    public function up(): void
    {
        Schema::connection('webmcp_lab')->create('webmcp_lab_services', function (Blueprint $table) {
            $table->string('name', 80);
            $table->integer('price_idr');
            $table->integer('minutes');
            $table->string('note', 160)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('webmcp_lab')->dropIfExists('webmcp_lab_services');
    }
};
