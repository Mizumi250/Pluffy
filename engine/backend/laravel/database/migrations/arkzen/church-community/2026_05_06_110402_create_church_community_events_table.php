<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — church_community_events
// Connection: church_community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T11:04:02.583912Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'church_community';

    public function up(): void
    {
        Schema::connection('church_community')->create('church_community_events', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->date('event_date');
            $table->string('cover_photo_url', 500)->nullable();
            $table->boolean('is_members_only')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('church_community')->dropIfExists('church_community_events');
    }
};
