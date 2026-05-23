<?php

// ============================================================
// ARKZEN GENERATED MODEL — Employee
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T08:49:12.891740Z
// ============================================================

namespace App\Models\Arkzen\DtrGeofencing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory;

    protected $connection = 'dtr_geofencing';

    protected $table = 'dtr_geofencing_employees';

    protected $fillable = [
        'name',
        'email',
        'avatar',
        'is_active'
    ];

    protected $casts = [
        'id' => 'integer',
        'is_active' => 'boolean'
    ];

    public function employees()
    {
        return $this->hasMany(\App\Models\Arkzen\DtrGeofencing\TimeRecord::class, 'employee_id');
    }
}
