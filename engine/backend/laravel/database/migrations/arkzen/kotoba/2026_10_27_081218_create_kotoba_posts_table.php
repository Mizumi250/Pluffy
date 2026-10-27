<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_posts
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:18.424650Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_posts', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->string('author_name', 80);
            $table->string('author_color', 16)->nullable();
            $table->string('author_native', 8)->nullable();
            $table->string('lang', 8);
            $table->string('kind', 16)->default('moment');
            $table->integer('mission_id')->nullable();
            $table->text('body');
            $table->text('translation')->nullable();
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->integer('corrections_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_posts');
    }
};
