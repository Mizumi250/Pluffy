<?php

// ============================================================
// ARKZEN GENERATED SEEDER — PingLogArkzenSeeder
// Tatemono: middleware-test  |  Connection: middleware_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T09:10:08.030135Z
// ============================================================

namespace Database\Seeders\Arkzen\MiddlewareTest;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PingLogArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('middleware_test')->table('middleware_test_ping_logs')->truncate();

        DB::connection('middleware_test')->table('middleware_test_ping_logs')->insert([
            [
                'message' => 'First ping',
                'headers_ok' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'message' => 'Second ping',
                'headers_ok' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
