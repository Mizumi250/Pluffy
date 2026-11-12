<?php

// ============================================================
// ARKZEN GENERATED SEEDER — AccountArkzenSeeder
// Tatemono: aspnet-ledger  |  Connection: aspnet_ledger
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:32.691641Z
// ============================================================

namespace Database\Seeders\Arkzen\AspnetLedger;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AccountArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('aspnet_ledger')->table('aspnet_ledger_accounts')->truncate();

        DB::connection('aspnet_ledger')->table('aspnet_ledger_accounts')->insert([
            [
                'owner' => 'Ada',
                'balance' => 1000,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'owner' => 'Grace',
                'balance' => 500,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'owner' => 'Linus',
                'balance' => 250,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
