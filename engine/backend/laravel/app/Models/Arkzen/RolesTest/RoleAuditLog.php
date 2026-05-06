<?php

// ============================================================
// ARKZEN GENERATED MODEL — RoleAuditLog
// Tatemono: roles-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-06T06:08:30.493167Z
// ============================================================

namespace App\Models\Arkzen\RolesTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RoleAuditLog extends Model
{
    use HasFactory;

    protected $connection = 'roles_test';

    protected $table = 'roles_test_role_audit_logs';

    protected $fillable = [
        'user_id',
        'action',
        'role_required',
        'granted'
    ];

    protected $casts = [
        'user_id' => 'integer',
        'granted' => 'boolean'
    ];


}
