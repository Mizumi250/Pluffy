<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kairo_chips
// Connection: kairo
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T12:27:43.973961Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kairo';

    public function up(): void
    {
        Schema::connection('kairo')->create('kairo_chips', function (Blueprint $table) {
            $table->string('name', 60);
            $table->string('author', 60)->default('guest');
            $table->string('note', 160)->nullable();
            $table->longText('blueprint');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kairo')->dropIfExists('kairo_chips');
    }
};
