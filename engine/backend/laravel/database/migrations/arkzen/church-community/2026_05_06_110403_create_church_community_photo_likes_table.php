<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — church_community_photo_likes
// Connection: church_community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T11:04:03.043948Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'church_community';

    public function up(): void
    {
        Schema::connection('church_community')->create('church_community_photo_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photo_id')->constrained('church_community_photos')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('church_community_users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('church_community')->dropIfExists('church_community_photo_likes');
    }
};
