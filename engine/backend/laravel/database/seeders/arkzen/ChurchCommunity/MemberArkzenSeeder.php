<?php

// ============================================================
// ARKZEN GENERATED SEEDER — MemberArkzenSeeder
// Tatemono: church-community  |  Connection: church_community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-20T00:57:12.207869Z
// ============================================================

namespace Database\Seeders\Arkzen\ChurchCommunity;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MemberArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('church_community')->table('church_community_members')->truncate();

        DB::connection('church_community')->table('church_community_members')->insert([
            [
                'name' => 'Pastor James Reyes',
                'role' => 'pastor',
                'email' => 'james.reyes@gracechurch.com',
                'bio' => 'Lead pastor for 12 years. Passionate about community and discipleship.',
                'joined_at' => '2013-06-01',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Elder Maria Santos',
                'role' => 'elder',
                'email' => 'maria.santos@gracechurch.com',
                'bio' => 'Leads the women's ministry and Sunday school.',
                'joined_at' => '2015-03-15',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Deacon Carlo Cruz',
                'role' => 'deacon',
                'email' => 'carlo.cruz@gracechurch.com',
                'bio' => 'Oversees building and hospitality ministries.',
                'joined_at' => '2017-09-10',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Ana Dela Rosa',
                'role' => 'leader',
                'email' => 'ana.delarosa@gracechurch.com',
                'bio' => 'Youth ministry coordinator and worship team leader.',
                'joined_at' => '2019-01-20',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Ben Villanueva',
                'role' => 'member',
                'email' => 'ben.villanueva@gracechurch.com',
                'bio' => 'Active in the men's fellowship group.',
                'joined_at' => '2020-08-05',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Clara Manalo',
                'role' => 'member',
                'email' => 'clara.manalo@gracechurch.com',
                'bio' => 'Volunteers with children's church every Sunday.',
                'joined_at' => '2021-04-18',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
