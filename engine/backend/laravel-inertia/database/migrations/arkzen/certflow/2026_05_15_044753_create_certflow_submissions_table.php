<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — certflow_submissions
// Connection: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-15T04:47:53.984833Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'certflow';

    public function up(): void
    {
        Schema::connection('certflow')->create('certflow_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('certflow_templates')->onDelete('cascade');
            $table->string('submission_token', 64)->unique();
            $table->json('form_data');
            $table->string('recipient_email', 255)->nullable();
            $table->string('certificate_path', 500)->nullable();
            $table->string('qr_code', 1000)->nullable();
            $table->boolean('email_sent')->default(false);
            $table->dateTime('email_sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('certflow')->dropIfExists('certflow_submissions');
    }
};
