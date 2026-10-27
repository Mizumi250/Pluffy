<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_follows
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:18.890099Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_follows', function (Blueprint $table) {
            $table->id();
            $table->integer('follower_id');
            $table->integer('following_id');

            $table->unique(['follower_id', 'following_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_follows');
    }
};
