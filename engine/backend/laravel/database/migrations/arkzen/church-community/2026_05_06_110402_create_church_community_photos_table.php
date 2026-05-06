<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — church_community_photos
// Connection: church_community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T11:04:02.887357Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'church_community';

    public function up(): void
    {
        Schema::connection('church_community')->create('church_community_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('church_community_events')->onDelete('cascade');
            $table->foreignId('uploader_id')->constrained('church_community_users')->onDelete('cascade');
            $table->string('url', 500);
            $table->string('thumbnail_url', 500)->nullable();
            $table->string('caption', 500)->nullable();
            $table->string('file_name', 255);
            $table->integer('file_size')->nullable();
            $table->json('tags')->nullable();
            $table->integer('likes_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('church_community')->dropIfExists('church_community_photos');
    }
};
