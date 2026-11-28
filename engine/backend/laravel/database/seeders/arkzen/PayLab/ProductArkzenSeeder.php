<?php

// ============================================================
// ARKZEN GENERATED SEEDER — ProductArkzenSeeder
// Tatemono: pay-lab  |  Connection: pay_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:14:39.134767Z
// ============================================================

namespace Database\Seeders\Arkzen\PayLab;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('pay_lab')->table('pay_lab_products')->truncate();

        DB::connection('pay_lab')->table('pay_lab_products')->insert([
            [
                'slug' => 'flores-bajawa',
                'name' => 'Flores Bajawa',
                'region' => 'Flores, East Nusa Tenggara',
                'notes' => 'Orange peel, brown sugar and a clean finish',
                'roast' => 2,
                'price_cents' => 1800,
                'accent' => '#f4c430',
                'ink' => '#15171c',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'slug' => 'gayo-aceh',
                'name' => 'Gayo Aceh',
                'region' => 'Gayo highlands, Aceh',
                'notes' => 'Cocoa nib, cedar and very low acidity',
                'roast' => 3,
                'price_cents' => 1600,
                'accent' => '#f08a7e',
                'ink' => '#15171c',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'slug' => 'toraja-sapan',
                'name' => 'Toraja Sapan',
                'region' => 'Sapan, South Sulawesi',
                'notes' => 'Dark plum, tobacco leaf and a long finish',
                'roast' => 5,
                'price_cents' => 2100,
                'accent' => '#0f5c63',
                'ink' => '#f4f5f2',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
