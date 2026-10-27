<?php

// ============================================================
// ARKZEN GENERATED MODEL — Appointment
// Tatemono: clinic-appointment-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:29.098301Z
// ============================================================

namespace App\Models\Arkzen\ClinicAppointmentBooking;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Appointment extends Model
{
    use HasFactory;

    protected $connection = 'clinic_appointment_booking';

    protected $table = 'clinic_appointment_booking_appointments';

    protected $fillable = [
        'patient_id',
        'doctor_name',
        'date_time',
        'status'
    ];

    protected $casts = [
        'id' => 'integer',
        'date_time' => 'datetime'
    ];

    public function patient()
    {
        return $this->belongsTo(\App\Models\Arkzen\ClinicAppointmentBooking\ClinicAppointmentBookingPatient::class, 'patient_id');
    }
}
