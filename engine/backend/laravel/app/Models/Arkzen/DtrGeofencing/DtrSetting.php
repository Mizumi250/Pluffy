<?php

// ============================================================
// ARKZEN GENERATED MODEL — DtrSetting
// Tatemono: dtr-geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-05T23:44:19.597858Z
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
