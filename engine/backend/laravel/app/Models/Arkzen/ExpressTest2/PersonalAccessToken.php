<?php

// ============================================================
// ARKZEN GENERATED PERSONAL ACCESS TOKEN MODEL — express-test-2
// Isolated to: database/arkzen/express-test-2.sqlite
// DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Models\Arkzen\ExpressTest2;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;

class PersonalAccessToken extends SanctumToken
{
    protected $connection = 'express_test_2';
    protected $table      = 'express_test_2_personal_access_tokens';
}
