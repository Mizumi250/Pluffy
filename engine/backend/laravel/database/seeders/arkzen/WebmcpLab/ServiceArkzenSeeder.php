<?php

// ============================================================
// ARKZEN GENERATED SEEDER — ServiceArkzenSeeder
// Tatemono: webmcp-lab  |  Connection: webmcp_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T11:53:58.485391Z
// ============================================================

namespace Database\Seeders\Arkzen\WebmcpLab;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('webmcp_lab')->table('webmcp_lab_services')->truncate();

        DB::connection('webmcp_lab')->table('webmcp_lab_services')->insert([
            [
                'name' => 'Basic tune-up',
                'price_idr' => 75000,
                'minutes' => 45,
                'note' => 'Gears, brakes and tire pressure checked',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Chain replacement',
                'price_idr' => 120000,
                'minutes' => 30,
                'note' => 'Chain only, parts included',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Brake adjustment',
                'price_idr' => 50000,
                'minutes' => 20,
                'note' => 'Both wheels',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Puncture repair',
                'price_idr' => 25000,
                'minutes' => 15,
                'note' => 'Tube patch, one wheel',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Full overhaul',
                'price_idr' => 250000,
                'minutes' => 180,
                'note' => 'Strip down, clean, rebuild',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
