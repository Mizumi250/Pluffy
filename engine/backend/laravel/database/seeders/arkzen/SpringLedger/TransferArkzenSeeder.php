<?php

// ============================================================
// ARKZEN GENERATED SEEDER — TransferArkzenSeeder
// Tatemono: spring-ledger  |  Connection: spring_ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:27:05.058742Z
// ============================================================

namespace Database\Seeders\Arkzen\SpringLedger;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransferArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('spring_ledger')->table('spring_ledger_transfers')->truncate();

        DB::connection('spring_ledger')->table('spring_ledger_transfers')->insert([

        ]);
    }
}
