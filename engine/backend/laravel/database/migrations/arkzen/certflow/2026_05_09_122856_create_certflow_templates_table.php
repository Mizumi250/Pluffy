<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — certflow_templates
// Connection: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-09T12:28:56.465533Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'certflow';

    public function up(): void
    {
        Schema::connection('certflow')->create('certflow_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('description', 500)->nullable();
            $table->string('file_path', 500);
            $table->string('file_type')->default('png');
            $table->string('global_font', 100)->default('Inter');
            $table->boolean('is_default')->default(false);
            $table->string('link_token', 64)->nullable()->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('certflow')->dropIfExists('certflow_templates');
    }
};
