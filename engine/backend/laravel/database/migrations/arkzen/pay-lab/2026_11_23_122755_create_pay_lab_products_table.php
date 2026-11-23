<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — pay_lab_products
// Connection: pay_lab
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:27:55.447614Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pay_lab';

    public function up(): void
    {
        Schema::connection('pay_lab')->create('pay_lab_products', function (Blueprint $table) {
            $table->string('slug', 40)->unique();
            $table->string('name', 60);
            $table->string('region', 60);
            $table->string('notes', 160);
            $table->integer('roast');
            $table->integer('price_cents');
            $table->string('accent', 7);
            $table->string('ink', 7);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('pay_lab')->dropIfExists('pay_lab_products');
    }
};
