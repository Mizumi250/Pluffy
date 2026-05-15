<?php

// ============================================================
// ARKZEN GENERATED PERSONAL ACCESS TOKEN MODEL — certflow
// Isolated to: database/arkzen/certflow.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\Certflow;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;

class PersonalAccessToken extends SanctumToken
{
    protected $connection = 'certflow';
    protected $table      = 'certflow_personal_access_tokens';
}
