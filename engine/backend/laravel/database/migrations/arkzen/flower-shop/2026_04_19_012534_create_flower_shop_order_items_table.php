<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — flower_shop_order_items
// Connection: flower_shop
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-19T01:25:34.547326Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'flower_shop';

    public function up(): void
    {
        Schema::connection('flower_shop')->create('flower_shop_order_items', function (Blueprint $table) {
            $table->id();
            $table->integer('order_id');
            $table->integer('product_id');
            $table->string('product_name', 200);
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('flower_shop')->dropIfExists('flower_shop_order_items');
    }
};
