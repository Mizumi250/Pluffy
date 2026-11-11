<?php

// ============================================================
// ARKZEN GENERATED FACTORY — TestRecordFactory
// Tatemono: express-test-2
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:30.977878Z
// ============================================================

namespace Database\Factories\Arkzen\ExpressTest2;

use App\Models\Arkzen\ExpressTest2\TestRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

class TestRecordFactory extends Factory
{
    protected $model = TestRecord::class;

    public function definition(): array
    {
        return [
            'user_id' => fake()->word(),
            'title' => fake()->sentence(3),
            'status' => fake()->randomElement(['active', 'inactive']),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'done' => fake()->boolean(),
        ];
    }
}
