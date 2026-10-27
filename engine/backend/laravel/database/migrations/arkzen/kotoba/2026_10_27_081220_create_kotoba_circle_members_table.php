<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_circle_members
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:20.039416Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_circle_members', function (Blueprint $table) {
            $table->id();
            $table->integer('circle_id');
            $table->integer('user_id');

            $table->unique(['circle_id', 'user_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_circle_members');
    }
};
