<?php

// ============================================================
// ARKZEN GENERATED PERSONAL ACCESS TOKEN MODEL — body-mail-notification
// Isolated to: database/arkzen/body-mail-notification.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\BodyMailNotification;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;

class PersonalAccessToken extends SanctumToken
{
    protected $connection = 'body_mail_notification';
    protected $table      = 'body_mail_notification_personal_access_tokens';
}
