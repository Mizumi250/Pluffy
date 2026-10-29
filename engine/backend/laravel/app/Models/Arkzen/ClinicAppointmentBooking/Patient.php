<?php

// ============================================================
// ARKZEN GENERATED MODEL — Patient
// Tatemono: clinic-appointment-booking
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:50.401383Z
// ============================================================

namespace App\Models\Arkzen\ClinicAppointmentBooking;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Patient extends Model
{
    use HasFactory;

    protected $connection = 'clinic_appointment_booking';

    protected $table = 'clinic_appointment_booking_patients';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number'
    ];

    protected $casts = [
        'id' => 'integer'
    ];


}
