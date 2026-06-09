<?php

// ============================================================
// ARKZEN GENERATED MODEL — MailLog
// Tatemono: mail-test
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-09T05:23:11.320671Z
// ============================================================

namespace App\Models\Arkzen\MailTest;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MailLog extends Model
{
    use HasFactory;

    protected $connection = 'mail_test';

    protected $table = 'mail_test_mail_logs';

    protected $fillable = [
        'user_id',
        'to_email',
        'subject',
        'mail_class',
        'status',
        'error'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer'
    ];


}
