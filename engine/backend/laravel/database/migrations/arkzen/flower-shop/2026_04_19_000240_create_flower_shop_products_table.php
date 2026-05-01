<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — flower_shop_products
// Connection: flower_shop
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-04-19T00:02:40.890323Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'flower_shop';

    public function up(): void
    {
        Schema::connection('flower_shop')->create('flower_shop_products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image_url', 500)->nullable();
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('flower_shop')->dropIfExists('flower_shop_products');
    }
};
