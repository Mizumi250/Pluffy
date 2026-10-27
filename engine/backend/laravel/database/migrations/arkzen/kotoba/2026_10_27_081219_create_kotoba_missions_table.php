<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_missions
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:19.059842Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_missions', function (Blueprint $table) {
            $table->id();
            $table->string('lang', 8)->default('any');
            $table->string('level', 4)->default('A1');
            $table->string('title', 120);
            $table->text('prompt');
            $table->text('hint')->nullable();
            $table->integer('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_missions');
    }
};
