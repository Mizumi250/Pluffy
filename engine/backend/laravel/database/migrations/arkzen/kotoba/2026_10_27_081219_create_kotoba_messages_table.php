<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — kotoba_messages
// Connection: kotoba
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:19.727440Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'kotoba';

    public function up(): void
    {
        Schema::connection('kotoba')->create('kotoba_messages', function (Blueprint $table) {
            $table->id();
            $table->integer('conversation_id')->nullable();
            $table->integer('circle_id')->nullable();
            $table->integer('sender_id');
            $table->string('sender_name', 80);
            $table->string('sender_color', 16)->nullable();
            $table->text('body');
            $table->string('lang', 8)->nullable();
            $table->text('corrected')->nullable();
            $table->text('note')->nullable();
            $table->integer('corrected_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('kotoba')->dropIfExists('kotoba_messages');
    }
};
