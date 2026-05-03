<?php

// ============================================================
// ARKZEN GENERATED SEEDER — TicketArkzenSeeder
// Tatemono: queue-flow  |  Connection: queue_flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-03T02:32:29.237557Z
// ============================================================

namespace Database\Seeders\Arkzen\QueueFlow;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('queue_flow')->table('queue_flow_tickets')->truncate();

        DB::connection('queue_flow')->table('queue_flow_tickets')->insert([
            [
                'queue_id' => 1,
                'ticket_number' => 'G-001',
                'customer_name' => 'Maria Santos',
                'status' => 'done',
                'position' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'queue_id' => 1,
                'ticket_number' => 'G-002',
                'customer_name' => 'Juan dela Cruz',
                'status' => 'serving',
                'position' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'queue_id' => 1,
                'ticket_number' => 'G-003',
                'customer_name' => 'Ana Reyes',
                'status' => 'waiting',
                'position' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'queue_id' => 1,
                'ticket_number' => 'G-004',
                'customer_name' => 'Carlo Bautista',
                'status' => 'waiting',
                'position' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'queue_id' => 2,
                'ticket_number' => 'P-001',
                'customer_name' => 'Elena Gomez',
                'status' => 'serving',
                'position' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'queue_id' => 2,
                'ticket_number' => 'P-002',
                'customer_name' => 'Rico Fernandez',
                'status' => 'waiting',
                'position' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
