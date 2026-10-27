<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_circles
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:19.861558Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_circles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('emoji', 8)->default('💬');
            $table->string('lang', 8);
            $table->string('level', 4)->default('A1');
            $table->text('description')->nullable();
            $table->integer('owner_id');
            $table->integer('members_count')->default(1);
            $table->integer('weekly_goal')->default(50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_circles');
    }
};
