<?php

// ============================================================
// ARKZEN GENERATED PERSONAL ACCESS TOKEN MODEL — shikaku
// Isolated to: database/arkzen/shikaku.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\Shikaku;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;

class PersonalAccessToken extends SanctumToken
{
    protected $connection = 'shikaku';
    protected $table      = 'shikaku_personal_access_tokens';
}
