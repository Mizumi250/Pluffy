<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — flower_shop_orders
// Connection: flower_shop
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-18T13:11:37.036005Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'flower_shop';

    public function up(): void
    {
        Schema::connection('flower_shop')->create('flower_shop_orders', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name', 200);
            $table->string('customer_email', 200);
            $table->text('customer_address');
            $table->decimal('total_amount', 10, 2);
            $table->string('status', 50)->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('flower_shop')->dropIfExists('flower_shop_orders');
    }
};
