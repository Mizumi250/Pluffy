<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — only_funds_donations
// Connection: only_funds
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-08T07:14:46.066698Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'only_funds';

    public function up(): void
    {
        Schema::connection('only_funds')->create('only_funds_donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('campaigns')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('setNull');
            $table->string('donor_name', 255);
            $table->string('donor_email', 255);
            $table->decimal('amount', 12, 2);
            $table->text('message')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('payment_status', 20)->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('only_funds')->dropIfExists('only_funds_donations');
    }
};
