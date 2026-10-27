<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_lessons
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:19.179564Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_lessons', function (Blueprint $table) {
            $table->id();
            $table->string('lang', 8);
            $table->string('unit', 80);
            $table->string('title', 120);
            $table->string('emoji', 8)->nullable();
            $table->string('level', 4)->default('A1');
            $table->integer('position')->default(0);
            $table->integer('xp')->default(15);
            $table->longText('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_lessons');
    }
};
