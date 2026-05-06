<?php

// ============================================================
// ARKZEN GENERATED UPDATE MIGRATION — flower_shop_products
// Connection: flower_shop
// Generated: 2026-04-17T04:19:37.392084Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'flower_shop';

    public function up(): void
    {
        Schema::connection('flower_shop')->table('flower_shop_products', function (Blueprint $table) {
            $table->string('category', 100);
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        // Reverse if needed
    }
};
