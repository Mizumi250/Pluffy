<?php

// ============================================================
// ARKZEN GENERATED SEEDER — ChipArkzenSeeder
// Tatemono: kairo  |  Connection: kairo
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-24T07:37:03.191843Z
// ============================================================

namespace Database\Seeders\Arkzen\Kairo;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChipArkzenSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('kairo')->table('kairo_chips')->truncate();

        DB::connection('kairo')->table('kairo_chips')->insert([
            [
                'name' => 'half-adder',
                'author' => 'Haruto Sakamoto',
                'note' => 'Adds two bits. The first lamp is SUM, the second is CARRY.',
                'blueprint' => '{"parts":[{"id":1,"kind":"in","x":0,"y":0},{"id":2,"kind":"in","x":0,"y":3},{"id":3,"kind":"nand","x":4,"y":1},{"id":4,"kind":"nand","x":8,"y":0},{"id":5,"kind":"nand","x":8,"y":3},{"id":6,"kind":"nand","x":12,"y":1},{"id":7,"kind":"nand","x":8,"y":6},{"id":8,"kind":"out","x":16,"y":1},{"id":9,"kind":"out","x":12,"y":6}],"wires":[{"id":1,"from":[1,0],"to":[3,0]},{"id":2,"from":[2,0],"to":[3,1]},{"id":3,"from":[1,0],"to":[4,0]},{"id":4,"from":[3,0],"to":[4,1]},{"id":5,"from":[2,0],"to":[5,0]},{"id":6,"from":[3,0],"to":[5,1]},{"id":7,"from":[4,0],"to":[6,0]},{"id":8,"from":[5,0],"to":[6,1]},{"id":9,"from":[6,0],"to":[8,0]},{"id":10,"from":[3,0],"to":[7,0]},{"id":11,"from":[3,0],"to":[7,1]},{"id":12,"from":[7,0],"to":[9,0]}]}',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'sr-latch',
                'author' => 'Dmitri Volkov',
                'note' => 'One bit of memory. Both inputs high keeps the last state.',
                'blueprint' => '{"parts":[{"id":1,"kind":"in","x":0,"y":0},{"id":2,"kind":"in","x":0,"y":4},{"id":3,"kind":"nand","x":4,"y":0},{"id":4,"kind":"nand","x":4,"y":4},{"id":5,"kind":"out","x":8,"y":0},{"id":6,"kind":"out","x":8,"y":4}],"wires":[{"id":1,"from":[1,0],"to":[3,0]},{"id":2,"from":[4,0],"to":[3,1]},{"id":3,"from":[2,0],"to":[4,0]},{"id":4,"from":[3,0],"to":[4,1]},{"id":5,"from":[3,0],"to":[5,0]},{"id":6,"from":[4,0],"to":[6,0]}]}',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
