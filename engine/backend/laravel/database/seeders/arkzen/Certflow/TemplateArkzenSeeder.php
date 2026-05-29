<?php

// ============================================================
// ARKZEN GENERATED SEEDER — TemplateArkzenSeeder
// Tatemono: certflow  |  Connection: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-29T06:46:57.897515Z
// ============================================================

namespace Database\Seeders\Arkzen\Certflow;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TemplateArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('certflow')->table('certflow_templates')->truncate();

        DB::connection('certflow')->table('certflow_templates')->insert([
            [
                'name' => 'Achievement Certificate',
                'description' => 'Classic achievement award template',
                'file_path' => '/tatemonos/certflow/assets/templates/default-1.png',
                'file_type' => 'png',
                'global_font' => 'Playfair Display',
                'is_default' => true,
                'link_token' => 'default-token-achievement-001',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Completion Certificate',
                'description' => 'Course or training completion template',
                'file_path' => '/tatemonos/certflow/assets/templates/default-2.png',
                'file_type' => 'png',
                'global_font' => 'Montserrat',
                'is_default' => true,
                'link_token' => 'default-token-completion-002',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Appreciation Certificate',
                'description' => 'Employee or volunteer appreciation template',
                'file_path' => '/tatemonos/certflow/assets/templates/default-3.png',
                'file_type' => 'png',
                'global_font' => 'Georgia',
                'is_default' => true,
                'link_token' => 'default-token-appreciation-003',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
