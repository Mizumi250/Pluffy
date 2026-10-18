<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — shikaku_saves
// Connection: shikaku
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:30:24.421464Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'shikaku';

    public function up(): void
    {
        Schema::connection('shikaku')->create('shikaku_saves', function (Blueprint $table) {
            $table->id();
            $table->integer('project_id');
            $table->longText('frames_json');
            $table->integer('version')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('shikaku')->dropIfExists('shikaku_saves');
    }
};
