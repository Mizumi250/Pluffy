<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_lesson_results
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:19.292386Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_lesson_results', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->integer('lesson_id');
            $table->integer('score')->default(0);
            $table->integer('best')->default(0);

            $table->unique(['user_id', 'lesson_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_lesson_results');
    }
};
