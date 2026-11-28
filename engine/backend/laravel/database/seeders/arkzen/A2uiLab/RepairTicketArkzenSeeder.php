<?php

// ============================================================
// ARKZEN GENERATED SEEDER — RepairTicketArkzenSeeder
// Tatemono: a2ui-lab  |  Connection: a2ui_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:14:03.740071Z
// ============================================================

namespace Database\Seeders\Arkzen\A2uiLab;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RepairTicketArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('a2ui_lab')->table('a2ui_lab_repair_tickets')->truncate();

        DB::connection('a2ui_lab')->table('a2ui_lab_repair_tickets')->insert([
            [
                'code' => 'RR-2041',
                'customer' => 'Haruto Nakamura',
                'bike' => 'Green commuter, 26 inch',
                'status' => 'in_progress',
                'note' => 'Waiting for the new chain to be fitted',
                'ready_by' => 'Tomorrow, 15:00',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'code' => 'RR-2042',
                'customer' => 'Dmitri Sokolov',
                'bike' => 'Black folding bike',
                'status' => 'ready',
                'note' => 'Brakes adjusted, ready for pickup',
                'ready_by' => 'Today',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'code' => 'RR-2043',
                'customer' => 'Siti Rahmawati',
                'bike' => 'Red city bike',
                'status' => 'waiting',
                'note' => 'In the queue',
                'ready_by' => 'In 2 days',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'code' => 'RR-2044',
                'customer' => 'Jonas Keller',
                'bike' => 'Grey road bike',
                'status' => 'picked_up',
                'note' => 'Collected',
                'ready_by' => 'Done',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
