<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — flower_shop_appointments
// Connection: flower_shop
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-17T04:19:04.045906Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'flower_shop';

    public function up(): void
    {
        Schema::connection('flower_shop')->create('flower_shop_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('flower_shop_users')->onDelete('cascade');
            $table->string('service_type', 100);
            $table->dateTime('appointment_date');
            $table->string('status', 50)->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('flower_shop')->dropIfExists('flower_shop_appointments');
    }
};
