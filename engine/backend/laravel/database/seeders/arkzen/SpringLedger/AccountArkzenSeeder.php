<?php

// ============================================================
// ARKZEN GENERATED SEEDER — AccountArkzenSeeder
// Tatemono: spring-ledger  |  Connection: spring_ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:56:07.387442Z
// ============================================================

namespace Database\Seeders\Arkzen\SpringLedger;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('spring_ledger')->table('spring_ledger_accounts')->truncate();

        DB::connection('spring_ledger')->table('spring_ledger_accounts')->insert([
            [
                'id' => 1,
                'name' => 'Operating Account',
                'balance' => '12500.00',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'name' => 'Reserve Account',
                'balance' => '3200.00',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
