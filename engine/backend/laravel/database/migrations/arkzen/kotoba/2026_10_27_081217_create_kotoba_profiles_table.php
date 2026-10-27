<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_profiles
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:17.940482Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_profiles', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->unique();
            $table->string('display_name', 80);
            $table->text('bio')->nullable();
            $table->string('native_lang', 8)->default('en');
            $table->string('learning_lang', 8)->default('es');
            $table->string('level', 4)->default('A1');
            $table->string('country', 80)->nullable();
            $table->string('interests', 500)->nullable();
            $table->string('avatar_color', 16)->default('#0a84ff');
            $table->integer('xp')->default(0);
            $table->integer('streak')->default(0);
            $table->integer('best_streak')->default(0);
            $table->date('last_active')->nullable();
            $table->integer('daily_goal')->default(3);
            $table->integer('words_written')->default(0);
            $table->integer('messages_sent')->default(0);
            $table->boolean('onboarded')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_profiles');
    }
};
