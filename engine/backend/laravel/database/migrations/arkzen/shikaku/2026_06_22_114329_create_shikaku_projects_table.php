<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — shikaku_projects
// Connection: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T11:43:29.845526Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'shikaku';

    public function up(): void
    {
        Schema::connection('shikaku')->create('shikaku_projects', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->string('name', 255);
            $table->integer('width')->default(32);
            $table->integer('height')->default(32);
            $table->text('thumbnail')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('shikaku')->dropIfExists('shikaku_projects');
    }
};
