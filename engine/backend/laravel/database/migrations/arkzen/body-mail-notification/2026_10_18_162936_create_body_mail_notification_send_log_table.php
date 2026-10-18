<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — body_mail_notification_send_log
// Connection: body_mail_notification
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T16:29:36.052386Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'body_mail_notification';

    public function up(): void
    {
        Schema::connection('body_mail_notification')->create('body_mail_notification_send_log', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->nullable();
            $table->string('to_email')->nullable();
            $table->string('subject')->nullable();
            $table->string('mail_class')->nullable();
            $table->string('kind', 20)->default('mail');
            $table->string('status', 20)->default('sent');
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('body_mail_notification')->dropIfExists('body_mail_notification_send_log');
    }
};
