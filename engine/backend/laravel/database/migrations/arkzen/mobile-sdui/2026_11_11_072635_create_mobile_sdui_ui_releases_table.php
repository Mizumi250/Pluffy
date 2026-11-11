<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — mobile_sdui_ui_releases
// Connection: mobile_sdui
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:26:35.279239Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mobile_sdui';

    public function up(): void
    {
        Schema::connection('mobile_sdui')->create('mobile_sdui_ui_releases', function (Blueprint $table) {
            $table->id();
            $table->text('configuration');
            $table->string('activate_at', 40);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('mobile_sdui')->dropIfExists('mobile_sdui_ui_releases');
    }
};
