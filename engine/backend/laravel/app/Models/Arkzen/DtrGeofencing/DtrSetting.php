<?php

// ============================================================
// ARKZEN GENERATED MODEL — DtrSetting
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T12:30:14.557731Z
// ============================================================

namespace App\Models\Arkzen\DtrGeofencing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DtrSetting extends Model
{
    use HasFactory;

    protected $connection = 'dtr_geofencing';

    protected $table = 'dtr_geofencing_dtr_settings';

    protected $fillable = [
        'key',
        'value'
    ];

    protected $casts = [
        'id' => 'integer'
    ];


}
