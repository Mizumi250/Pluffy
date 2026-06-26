<?php

// ============================================================
// ARKZEN GENERATED SEEDER — ShikakuSaveArkzenSeeder
// Tatemono: shikaku  |  Connection: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-26T07:09:03.016143Z
// ============================================================

namespace Database\Seeders\Arkzen\Shikaku;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShikakuSaveArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('shikaku')->table('shikaku_saves')->truncate();

        DB::connection('shikaku')->table('shikaku_saves')->insert([

        ]);
    }
}
