<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — mail_test_mail_logs
// Connection: mail_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:29:49.966287Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mail_test';

    public function up(): void
    {
        Schema::connection('mail_test')->create('mail_test_mail_logs', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->nullable();
            $table->string('to_email');
            $table->string('subject');
            $table->string('mail_class');
            $table->string('status')->default('sent');
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('mail_test')->dropIfExists('mail_test_mail_logs');
    }
};
