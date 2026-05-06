<?php

// ============================================================
// ARKZEN GENERATED MIGRATION — roles_test_role_audit_logs
// Connection: roles_test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-01T09:26:56.439922Z
// ============================================================

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'roles_test';

    public function up(): void
    {
        Schema::connection('roles_test')->create('roles_test_role_audit_logs', function (Blueprint $table) {
            $table->integer('user_id')->nullable();
            $table->string('action');
            $table->string('role_required');
            $table->boolean('granted');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('roles_test')->dropIfExists('roles_test_role_audit_logs');
    }
};
