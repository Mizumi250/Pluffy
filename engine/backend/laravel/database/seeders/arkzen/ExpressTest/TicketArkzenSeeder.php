<?php

// ============================================================
// ARKZEN GENERATED SEEDER — TicketArkzenSeeder
// Tatemono: express-test  |  Connection: express_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:43.409090Z
// ============================================================

namespace Database\Seeders\Arkzen\ExpressTest;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('express_test')->table('express_test_tickets')->truncate();

        DB::connection('express_test')->table('express_test_tickets')->insert([
            [
                'title' => 'Seeded ticket A',
                'status' => 'open',
                'priority' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Seeded ticket B',
                'status' => 'closed',
                'priority' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
