<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — upload_test_uploaded_files
// Connection: upload_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:30:25.055728Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'upload_test';

    public function up(): void
    {
        Schema::connection('upload_test')->create('upload_test_uploaded_files', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->nullable();
            $table->string('original_name');
            $table->string('stored_name');
            $table->string('mime_type');
            $table->integer('size_bytes');
            $table->string('disk_path');
            $table->boolean('is_image');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('upload_test')->dropIfExists('upload_test_uploaded_files');
    }
};
