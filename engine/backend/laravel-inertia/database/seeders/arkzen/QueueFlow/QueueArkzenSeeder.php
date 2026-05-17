<?php

// ============================================================
// ARKZEN GENERATED SEEDER — QueueArkzenSeeder
// Tatemono: queue-flow  |  Connection: queue_flow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T13:37:07.388819Z
// ============================================================

namespace Database\Seeders\Arkzen\QueueFlow;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QueueArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('queue_flow')->table('queue_flow_queues')->truncate();

        DB::connection('queue_flow')->table('queue_flow_queues')->insert([
            [
                'name' => 'General',
                'description' => 'General service queue',
                'prefix' => 'G',
                'is_active' => true,
                'avg_wait_minutes' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Priority',
                'description' => 'Priority service queue',
                'prefix' => 'P',
                'is_active' => true,
                'avg_wait_minutes' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
