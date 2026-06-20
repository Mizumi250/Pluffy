<?php

// ============================================================
// ARKZEN GENERATED MODEL — SendLog
// Tatemono: body-mail-notification
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T01:50:05.650680Z
// ============================================================

namespace App\Models\Arkzen\BodyMailNotification;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SendLog extends Model
{
    use HasFactory;

    protected $connection = 'body_mail_notification';

    protected $table = 'body_mail_notification_send_log';

    protected $fillable = [
        'user_id',
        'to_email',
        'subject',
        'mail_class',
        'kind',
        'status',
        'error'
    ];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer'
    ];


}
