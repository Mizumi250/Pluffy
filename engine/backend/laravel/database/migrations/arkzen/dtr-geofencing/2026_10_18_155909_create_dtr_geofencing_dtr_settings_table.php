<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — dtr_geofencing_dtr_settings
// Connection: dtr_geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:09.012981Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'dtr_geofencing';

    public function up(): void
    {
        Schema::connection('dtr_geofencing')->create('dtr_geofencing_dtr_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 255)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('dtr_geofencing')->dropIfExists('dtr_geofencing_dtr_settings');
    }
};
