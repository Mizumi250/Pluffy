<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — inventory_management_inventories
// Connection: inventory_management
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-18T15:59:20.603210Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'inventory_management';

    public function up(): void
    {
        Schema::connection('inventory_management')->create('inventory_management_inventories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('sku', 100)->unique();
            $table->integer('quantity')->default(0);
            $table->decimal('price', 10, 2);
            $table->string('category', 100)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('inventory_management')->dropIfExists('inventory_management_inventories');
    }
};
