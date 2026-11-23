<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — webmcp_lab_bookings
// Connection: webmcp_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:28:15.930229Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'webmcp_lab';

    public function up(): void
    {
        Schema::connection('webmcp_lab')->create('webmcp_lab_bookings', function (Blueprint $table) {
            $table->string('name', 80);
            $table->string('service', 80);
            $table->string('day', 10);
            $table->string('slot', 5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('webmcp_lab')->dropIfExists('webmcp_lab_bookings');
    }
};
