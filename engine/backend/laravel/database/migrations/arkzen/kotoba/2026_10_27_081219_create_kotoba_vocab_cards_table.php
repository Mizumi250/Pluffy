<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_vocab_cards
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:19.433990Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_vocab_cards', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->string('lang', 8);
            $table->string('term', 255);
            $table->string('meaning', 255);
            $table->text('example')->nullable();
            $table->string('source', 16)->default('manual');
            $table->float('ease')->default(2.5);
            $table->integer('interval_days')->default(0);
            $table->integer('reps')->default(0);
            $table->integer('lapses')->default(0);
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_vocab_cards');
    }
};
