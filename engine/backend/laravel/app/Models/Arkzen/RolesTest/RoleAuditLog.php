<?php

// ============================================================
// ARKZEN GENERATED MODEL — RoleAuditLog
// Tatemono: roles-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T02:28:59.279377Z
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
