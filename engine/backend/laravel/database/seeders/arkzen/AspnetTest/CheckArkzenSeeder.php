<?php

// ============================================================
// ARKZEN GENERATED SEEDER — CheckArkzenSeeder
// Tatemono: aspnet-test  |  Connection: aspnet_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:34.125287Z
// ============================================================

namespace Database\Seeders\Arkzen\AspnetTest;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CheckArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('aspnet_test')->table('aspnet_test_checks')->truncate();

        DB::connection('aspnet_test')->table('aspnet_test_checks')->insert([
            [
                'name' => 'ASP.NET engine ready',
                'status' => 'passed',
                'priority' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'C# endpoint compiled on first call',
                'status' => 'passed',
                'priority' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Validation rules enforced',
                'status' => 'pending',
                'priority' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Policy blocks non-owners',
                'status' => 'pending',
                'priority' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Transaction rolls back on failure',
                'status' => 'failed',
                'priority' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
