<?php

// ============================================================
// ARKZEN GENERATED SEEDER — NoteArkzenSeeder
// Tatemono: spring-test  |  Connection: spring_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:08.042930Z
// ============================================================

namespace Database\Seeders\Arkzen\SpringTest;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NoteArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('spring_test')->table('spring_test_notes')->truncate();

        DB::connection('spring_test')->table('spring_test_notes')->insert([
            [
                'id' => 1,
                'title' => 'Java backend ready',
                'body' => 'This sample is generated from shared Arkzen DSL and the :java variant.',
                'pinned' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
