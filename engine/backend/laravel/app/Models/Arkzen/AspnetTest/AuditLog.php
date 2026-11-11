<?php

// ============================================================
// ARKZEN GENERATED MODEL — AuditLog
// Tatemono: aspnet-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:31.134572Z
// ============================================================

namespace App\Models\Arkzen\AspnetTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AuditLog extends Model
{
    use HasFactory;

    protected $connection = 'aspnet_test';

    protected $table = 'aspnet_test_audit_logs';

    protected $fillable = [
        'action',
        'check_id',
        'actor',
        'detail'
    ];

    protected $casts = [
        'id' => 'integer',
        'check_id' => 'integer'
    ];


}
