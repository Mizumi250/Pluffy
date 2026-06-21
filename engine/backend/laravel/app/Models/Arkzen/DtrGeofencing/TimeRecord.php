<?php

// ============================================================
// ARKZEN GENERATED MODEL — TimeRecord
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:50.191246Z
// ============================================================

namespace App\Models\Arkzen\DtrGeofencing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TimeRecord extends Model
{
    use HasFactory;

    protected $connection = 'dtr_geofencing';

    protected $table = 'dtr_geofencing_time_records';

    protected $fillable = [
        'employee_id',
        'type',
        'timestamp',
        'latitude',
        'longitude',
        'within_geofence',
        'notes'
    ];

    protected $casts = [
        'id' => 'integer',
        'timestamp' => 'datetime',
        'latitude' => 'decimal:2',
        'longitude' => 'decimal:2',
        'within_geofence' => 'boolean'
    ];

    public function employee()
    {
        return $this->belongsTo(\App\Models\Arkzen\DtrGeofencing\Employee::class, 'employee_id');
    }
}
