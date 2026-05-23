<?php

// ============================================================
// ARKZEN GENERATED SEEDER — EventArkzenSeeder
// Tatemono: church-community  |  Connection: church_community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-23T13:04:08.462198Z
// ============================================================

namespace Database\Seeders\Arkzen\ChurchCommunity;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('church_community')->table('church_community_events')->truncate();

        DB::connection('church_community')->table('church_community_events')->insert([
            [
                'title' => 'Sunday Worship Service',
                'description' => 'Our weekly gathering for worship, prayer, and the Word.',
                'event_date' => '2026-05-04',
                'is_members_only' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Youth Outreach Day',
                'description' => 'Community service outreach led by the youth ministry.',
                'event_date' => '2026-04-27',
                'is_members_only' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Easter Celebration',
                'description' => 'Sunrise service and Easter celebration with choir and children's pageant.',
                'event_date' => '2026-04-20',
                'is_members_only' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
