<?php

// ============================================================
// ARKZEN GENERATED SEEDER — UiReleaseArkzenSeeder
// Tatemono: mobile-sdui  |  Connection: mobile_sdui
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T08:35:41.389808Z
// ============================================================

namespace Database\Seeders\Arkzen\MobileSdui;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UiReleaseArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('mobile_sdui')->table('mobile_sdui_ui_releases')->truncate();

        DB::connection('mobile_sdui')->table('mobile_sdui_ui_releases')->insert([
            [
                'configuration' => '{"buttons":[{"id":"daily-check-in","label":"Daily check-in","action":"alert","message":"Thanks for checking in!"},{"id":"view-updates","label":"View updates","action":"alert","message":"You are all caught up."}]}',
                'activate_at' => '2000-01-01T00:00:00.000Z',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
