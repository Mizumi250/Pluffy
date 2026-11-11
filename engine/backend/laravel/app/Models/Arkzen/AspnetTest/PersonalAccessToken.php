<?php

// ============================================================
// ARKZEN GENERATED PERSONAL ACCESS TOKEN MODEL — aspnet-test
// Isolated to: database/arkzen/aspnet-test.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\AspnetTest;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;

class PersonalAccessToken extends SanctumToken
{
    protected $connection = 'aspnet_test';
    protected $table      = 'aspnet_test_personal_access_tokens';
}
