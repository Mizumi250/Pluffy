<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — clinic_appointment_booking_appointments
// Connection: clinic_appointment_booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-24T13:18:32.373103Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'clinic_appointment_booking';

    public function up(): void
    {
        Schema::connection('clinic_appointment_booking')->create('clinic_appointment_booking_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('clinic_appointment_booking_patients')->onDelete('cascade');
            $table->string('doctor_name', 255);
            $table->dateTime('date_time');
            $table->string('status', 50)->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('clinic_appointment_booking')->dropIfExists('clinic_appointment_booking_appointments');
    }
};
