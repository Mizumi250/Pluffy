<?php

// ============================================================
// ARKZEN GENERATED SEEDER — EmployeeArkzenSeeder
// Tatemono: dtr-geofencing  |  Connection: dtr_geofencing
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-09T05:23:09.453105Z
// ============================================================

namespace Database\Seeders\Arkzen\DtrGeofencing;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeeArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('dtr_geofencing')->table('dtr_geofencing_employees')->truncate();

        DB::connection('dtr_geofencing')->table('dtr_geofencing_employees')->insert([
            [
                'name' => 'Alex Rivera',
                'email' => 'alex@example.com',
                'avatar' => 'https://i.pravatar.cc/150?img=1',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Jamie Chen',
                'email' => 'jamie@example.com',
                'avatar' => 'https://i.pravatar.cc/150?img=5',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Taylor Smith',
                'email' => 'taylor@example.com',
                'avatar' => 'https://i.pravatar.cc/150?img=8',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
