<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — a2ui_lab_bookings
// Connection: a2ui_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:27:18.411905Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'a2ui_lab';

    public function up(): void
    {
        Schema::connection('a2ui_lab')->create('a2ui_lab_bookings', function (Blueprint $table) {
            $table->string('name', 80);
            $table->string('service', 80);
            $table->string('day', 10);
            $table->string('slot', 5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('a2ui_lab')->dropIfExists('a2ui_lab_bookings');
    }
};
