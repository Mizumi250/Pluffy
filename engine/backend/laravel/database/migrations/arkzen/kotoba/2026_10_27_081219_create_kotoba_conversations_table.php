<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_conversations
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:19.562142Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_conversations', function (Blueprint $table) {
            $table->id();
            $table->integer('user_a');
            $table->integer('user_b');
            $table->text('last_message')->nullable();
            $table->dateTime('last_at')->nullable();

            $table->unique(['user_a', 'user_b']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_conversations');
    }
};
