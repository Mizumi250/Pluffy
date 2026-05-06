<?php

// ============================================================
// ARKZEN GENERATED SEEDER — ItemArkzenSeeder
// Tatemono: crud-test  |  Connection: crud_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-05T23:44:19.155786Z
// ============================================================

namespace Database\Seeders\Arkzen\CrudTest;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ItemArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('crud_test')->table('crud_test_items')->truncate();

        DB::connection('crud_test')->table('crud_test_items')->insert([
            [
                'name' => 'Alpha Item',
                'description' => 'First seeded item for CRUD testing',
                'status' => 'active',
                'priority' => 1,
                'tags' => 'test,seed',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Beta Item',
                'description' => 'Second seeded item',
                'status' => 'pending',
                'priority' => 2,
                'tags' => 'test',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
