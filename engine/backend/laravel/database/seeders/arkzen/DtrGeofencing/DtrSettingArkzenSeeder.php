<?php

// ============================================================
// ARKZEN GENERATED SEEDER — DtrSettingArkzenSeeder
// Tatemono: dtr-geofencing  |  Connection: dtr_geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T10:07:14.689148Z
// ============================================================

namespace Database\Seeders\Arkzen\DtrGeofencing;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DtrSettingArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('dtr_geofencing')->table('dtr_geofencing_dtr_settings')->truncate();

        DB::connection('dtr_geofencing')->table('dtr_geofencing_dtr_settings')->insert([
            [
                'key' => 'geofencing_enabled',
                'value' => 'true',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'office_latitude',
                'value' => '14.599512',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'office_longitude',
                'value' => '120.984219',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'geofence_radius_meters',
                'value' => '100',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
