<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — pay_lab_webhook_events
// Connection: pay_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:27:55.960321Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pay_lab';

    public function up(): void
    {
        Schema::connection('pay_lab')->create('pay_lab_webhook_events', function (Blueprint $table) {
            $table->string('event_id', 80)->unique();
            $table->string('type', 60);
            $table->string('order_public_id', 64)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('pay_lab')->dropIfExists('pay_lab_webhook_events');
    }
};
