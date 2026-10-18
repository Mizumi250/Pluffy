<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — dtr_geofencing_time_records
// Connection: dtr_geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:29:38.976481Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'dtr_geofencing';

    public function up(): void
    {
        Schema::connection('dtr_geofencing')->create('dtr_geofencing_time_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('type', 10);
            $table->dateTime('timestamp');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('within_geofence')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('dtr_geofencing')->dropIfExists('dtr_geofencing_time_records');
    }
};
