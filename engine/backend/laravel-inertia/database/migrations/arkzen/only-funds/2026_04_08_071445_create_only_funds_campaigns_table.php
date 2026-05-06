<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — only_funds_campaigns
// Connection: only_funds
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-08T07:14:45.995075Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'only_funds';

    public function up(): void
    {
        Schema::connection('only_funds')->create('only_funds_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->text('description');
            $table->decimal('goal_amount', 12, 2);
            $table->decimal('current_amount', 12, 2)->default(0);
            $table->string('image_url', 500)->nullable();
            $table->string('status', 20)->default('active');
            $table->date('end_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('only_funds')->dropIfExists('only_funds_campaigns');
    }
};
