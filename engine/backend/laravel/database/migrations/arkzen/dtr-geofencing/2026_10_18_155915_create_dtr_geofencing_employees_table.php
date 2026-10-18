<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — dtr_geofencing_employees
// Connection: dtr_geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:15.679187Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'dtr_geofencing';

    public function up(): void
    {
        Schema::connection('dtr_geofencing')->create('dtr_geofencing_employees', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('email', 255)->unique();
            $table->string('avatar', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('dtr_geofencing')->dropIfExists('dtr_geofencing_employees');
    }
};
