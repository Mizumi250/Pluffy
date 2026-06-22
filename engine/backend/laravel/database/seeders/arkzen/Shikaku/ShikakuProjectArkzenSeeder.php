<?php

// ============================================================
// ARKZEN GENERATED SEEDER — ShikakuProjectArkzenSeeder
// Tatemono: shikaku  |  Connection: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T12:17:14.621457Z
// ============================================================

namespace Database\Seeders\Arkzen\Shikaku;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShikakuProjectArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('shikaku')->table('shikaku_projects')->truncate();

        DB::connection('shikaku')->table('shikaku_projects')->insert([

        ]);
    }
}
