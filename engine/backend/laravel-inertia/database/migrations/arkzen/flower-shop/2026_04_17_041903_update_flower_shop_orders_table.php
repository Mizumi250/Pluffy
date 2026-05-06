<?php

// ============================================================
// ARKZEN GENERATED UPDATE MIGRATION — flower_shop_orders
// Connection: flower_shop
// Generated: 2026-04-17T04:19:03.639877Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'flower_shop';

    public function up(): void
    {
        Schema::connection('flower_shop')->table('flower_shop_orders', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('flower_shop_users')->onDelete('cascade');
            $table->string('order_number', 50)->unique();
            $table->date('delivery_date')->nullable();
            $table->text('delivery_address');
            $table->text('notes')->nullable();
        });
    }

    public function down(): void
    {
        // Reverse if needed
    }
};
