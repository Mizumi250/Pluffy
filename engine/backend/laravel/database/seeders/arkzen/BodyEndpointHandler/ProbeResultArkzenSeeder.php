<?php

// ============================================================
// ARKZEN GENERATED SEEDER — ProbeResultArkzenSeeder
// Tatemono: body-endpoint-handler  |  Connection: body_endpoint_handler
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-19T12:26:24.862852Z
// ============================================================

namespace Database\Seeders\Arkzen\BodyEndpointHandler;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProbeResultArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('body_endpoint_handler')->table('body_endpoint_handler_probe_results')->truncate();

        DB::connection('body_endpoint_handler')->table('body_endpoint_handler_probe_results')->insert([
            [
                'source' => 'seeder',
                'probe' => 'init-check',
                'payload' => '{"msg":"seeded"}',
                'result' => 'Seeded probe entry',
                'ok' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'source' => 'seeder',
                'probe' => 'health-ping',
                'payload' => NULL,
                'result' => 'All systems nominal',
                'ok' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'source' => 'seeder',
                'probe' => 'error-sample',
                'payload' => '{"trigger":"simulated"}',
                'result' => 'Simulated failure recorded',
                'ok' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
