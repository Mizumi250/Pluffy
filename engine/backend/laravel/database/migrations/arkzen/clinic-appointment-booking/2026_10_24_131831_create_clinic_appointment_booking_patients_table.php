<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — clinic_appointment_booking_patients
// Connection: clinic_appointment_booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:31.984066Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'clinic_appointment_booking';

    public function up(): void
    {
        Schema::connection('clinic_appointment_booking')->create('clinic_appointment_booking_patients', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 255);
            $table->string('last_name', 255);
            $table->string('email', 255)->unique();
            $table->string('phone_number', 191)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('clinic_appointment_booking')->dropIfExists('clinic_appointment_booking_patients');
    }
};
