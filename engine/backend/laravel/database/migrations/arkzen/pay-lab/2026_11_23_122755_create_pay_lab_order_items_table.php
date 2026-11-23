<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — pay_lab_order_items
// Connection: pay_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:27:55.838578Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pay_lab';

    public function up(): void
    {
        Schema::connection('pay_lab')->create('pay_lab_order_items', function (Blueprint $table) {
            $table->integer('order_id');
            $table->string('product_slug', 40);
            $table->string('name', 60);
            $table->integer('unit_cents');
            $table->integer('quantity');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('pay_lab')->dropIfExists('pay_lab_order_items');
    }
};
