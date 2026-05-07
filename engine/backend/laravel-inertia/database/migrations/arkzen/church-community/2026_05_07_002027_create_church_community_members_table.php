<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — church_community_members
// Connection: church_community
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-07T00:20:27.693420Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'church_community';

    public function up(): void
    {
        Schema::connection('church_community')->create('church_community_members', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('role')->default('member');
            $table->string('photo_url', 500)->nullable();
            $table->string('email', 255)->nullable();
            $table->text('bio')->nullable();
            $table->date('joined_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('church_community')->dropIfExists('church_community_members');
    }
};
