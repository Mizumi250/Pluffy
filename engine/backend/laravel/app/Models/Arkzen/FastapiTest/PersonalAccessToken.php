<?php

// ============================================================
// ARKZEN GENERATED PERSONAL ACCESS TOKEN MODEL — fastapi-test
// Isolated to: database/arkzen/fastapi-test.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\FastapiTest;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;

class PersonalAccessToken extends SanctumToken
{
    protected $connection = 'fastapi_test';
    protected $table      = 'fastapi_test_personal_access_tokens';
}
