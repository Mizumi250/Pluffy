<?php

// ============================================================
// ARKZEN GENERATED SEEDER — MissionArkzenSeeder
// Tatemono: kotoba  |  Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:54.768564Z
// ============================================================

namespace Database\Seeders\Arkzen\Kotoba;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MissionArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('kotoba')->table('kotoba_missions')->truncate();

        DB::connection('kotoba')->table('kotoba_missions')->insert([
            [
                'lang' => 'any',
                'level' => 'A1',
                'title' => 'Introduce yourself',
                'prompt' => 'Tell the community who you are, where you live and one thing you love doing. Write at least three sentences in your target language.',
                'hint' => 'Start simple: your name, your city, one hobby. Short and correct beats long and messy.',
                'position' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'any',
                'level' => 'A1',
                'title' => 'Your morning',
                'prompt' => 'Describe what you did this morning, step by step, from waking up to leaving the house.',
                'hint' => 'Use time words: first, then, after that. Present or past tense is fine.',
                'position' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'any',
                'level' => 'A1',
                'title' => 'A place you love',
                'prompt' => 'Describe a place that makes you feel at home. What does it look like, sound like and smell like?',
                'hint' => 'Try to use at least three adjectives you learned this week.',
                'position' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'any',
                'level' => 'A2',
                'title' => 'Dinner tonight',
                'prompt' => 'What are you eating or cooking tonight? Explain it as if you were telling a friend on the phone.',
                'hint' => 'Food words stick best when you attach a real memory to them.',
                'position' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'any',
                'level' => 'A2',
                'title' => 'Ask the community',
                'prompt' => 'Ask one real question you are curious about and invite native speakers to answer it.',
                'hint' => 'Real curiosity gets real answers. Avoid yes or no questions.',
                'position' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'any',
                'level' => 'A2',
                'title' => 'A small win',
                'prompt' => 'Share one small thing that went well this week and why it made you happy.',
                'hint' => 'Use because and so to connect your ideas.',
                'position' => 6,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'lang' => 'any',
                'level' => 'B1',
                'title' => 'Change my mind',
                'prompt' => 'Share a mild opinion you hold, for example about food, travel or music, and give two reasons for it.',
                'hint' => 'Opinions need connectors: however, because, in fact.',
                'position' => 7,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
