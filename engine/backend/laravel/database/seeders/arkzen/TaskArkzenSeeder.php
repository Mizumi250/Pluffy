<?php

// ============================================================
// ARKZEN GENERATED SEEDER — TaskArkzenSeeder
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-04T01:29:21.826506Z
// ============================================================

namespace Database\Seeders\Arkzen;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tasks')->truncate();

        DB::table('tasks')->insert([
            [
                'title' => 'Design homepage',
                'status' => 'done',
                'priority' => 'high',
                'project_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Implement responsive layout',
                'status' => 'in_progress',
                'priority' => 'high',
                'project_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Set up API endpoints',
                'status' => 'todo',
                'priority' => 'medium',
                'project_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Create app wireframes',
                'status' => 'done',
                'priority' => 'high',
                'project_id' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Set up authentication',
                'status' => 'in_progress',
                'priority' => 'high',
                'project_id' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'Build dashboard screen',
                'status' => 'todo',
                'priority' => 'medium',
                'project_id' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
