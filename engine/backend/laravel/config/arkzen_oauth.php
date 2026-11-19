<?php

// Social sign-in settings (only used by tatemonos that declare @arkzen:oauth).
// Read through config() so they keep working after `php artisan config:cache`.
// Secrets live in .env, never in a tatemono.

$keys = [
    'OAUTH_REDIRECT_BASE', 'OAUTH_FRONTEND_URL', 'OAUTH_STATE_SECRET', 'OAUTH_MICROSOFT_TENANT',
    'OAUTH_FACEBOOK_API_VERSION', 'OAUTH_INSTAGRAM_API_VERSION',
    'OAUTH_APPLE_TEAM_ID', 'OAUTH_APPLE_KEY_ID', 'OAUTH_APPLE_PRIVATE_KEY',
    'ARKZEN_ENGINE_SECRET', 'APP_KEY', 'APP_URL',
];

foreach (['google', 'github', 'twitter', 'apple', 'microsoft', 'facebook', 'instagram', 'discord'] as $provider) {
    $keys[] = 'OAUTH_' . strtoupper($provider) . '_CLIENT_ID';
    $keys[] = 'OAUTH_' . strtoupper($provider) . '_CLIENT_SECRET';
}

return array_combine($keys, array_map(fn (string $k) => env($k), $keys));
