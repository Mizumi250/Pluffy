<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — certflow_fields
// Connection: certflow
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-15T04:47:53.968224Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'certflow';

    public function up(): void
    {
        Schema::connection('certflow')->create('certflow_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('certflow_templates')->onDelete('cascade');
            $table->string('label', 100);
            $table->string('field_type')->default('text');
            $table->string('placeholder', 200)->nullable();
            $table->integer('x')->default(100);
            $table->integer('y')->default(100);
            $table->integer('width')->default(200);
            $table->integer('height')->default(40);
            $table->integer('font_size')->default(18);
            $table->string('font_family', 100)->default('Inter');
            $table->string('font_weight', 20)->default('normal');
            $table->string('font_style', 20)->default('normal');
            $table->string('text_align')->default('center');
            $table->string('color', 20)->default('#1a1a1a');
            $table->integer('layer_order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('certflow')->dropIfExists('certflow_fields');
    }
};
