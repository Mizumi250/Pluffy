<?php

// Framework-free test for App\Arkzen\Support\OAuthProviders (state, PKCE, provider requests, Apple JWT).
//   cd engine/backend/laravel && php tests/oauth_logic_test.php
// The Eloquent half (user linking) lives in the generated OAuthController and needs a booted app.

require __DIR__ . '/../app/Arkzen/Support/OAuthProviders.php';

use App\Arkzen\Support\OAuthProviders as P;

$failed = 0; $count = 0;
function check(string $name, bool $ok): void {
    global $failed, $count; $count++;
    if (!$ok) { $failed++; echo "  FAIL  $name\n"; } else { echo "  ok    $name\n"; }
}

$key = openssl_pkey_new(['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'prime256v1']);
openssl_pkey_export($key, $pem);
$pub = openssl_pkey_get_details($key)['key'];

$envMap = [
    'OAUTH_STATE_SECRET' => 'test-state-secret', 'OAUTH_REDIRECT_BASE' => 'http://app.test', 'OAUTH_FRONTEND_URL' => 'http://web.test',
    'OAUTH_GOOGLE_CLIENT_ID' => 'g-id', 'OAUTH_GOOGLE_CLIENT_SECRET' => 'g-secret',
    'OAUTH_TWITTER_CLIENT_ID' => 'x-id', 'OAUTH_TWITTER_CLIENT_SECRET' => 'x-secret',
    'OAUTH_APPLE_CLIENT_ID' => 'com.example.services', 'OAUTH_APPLE_TEAM_ID' => 'TEAM123456', 'OAUTH_APPLE_KEY_ID' => 'KEY1234567',
    'OAUTH_APPLE_PRIVATE_KEY' => str_replace("\n", '\n', $pem),
];
$env  = fn($k, $d = '') => $envMap[$k] ?? $d;
$seen = [];
$route = fn($method, $url, $headers, $body) => [404, '{}'];
$http = function ($method, $url, $headers, $body) use (&$seen, &$route) {
    $seen[] = compact('method', 'url', 'headers', 'body');
    return $route($method, $url, $headers, $body);
};
$o = new P($http, $env);
$last = function (string $prefix) use (&$seen) { for ($i = count($seen) - 1; $i >= 0; $i--) if (str_starts_with($seen[$i]['url'], $prefix)) return $seen[$i]; return null; };

echo "state\n";
$s = $o->signState(['n' => 'abc', 'p' => 'google', 's' => 'demo', 'e' => time() + 60]);
check('round-trips', ($o->readState($s)['n'] ?? null) === 'abc');
check('tampered state rejected', $o->readState(substr($s, 0, -2) . (str_ends_with($s, 'AA') ? 'BB' : 'AA')) === null);
check('tampered body rejected', $o->readState(preg_replace('/^v1\.[^.]+/', 'v1.' . P::b64url('{"n":"x","p":"google","s":"demo","e":' . (time() + 60) . '}'), $s)) === null);
check('expired state rejected', $o->readState($o->signState(['n' => 'a', 'e' => time() - 1])) === null);
check('garbage rejected', $o->readState('nope') === null && $o->readState(null) === null);
check('different secret rejects', (new P($http, fn($k, $d = '') => $k === 'OAUTH_STATE_SECRET' ? 'other' : ($envMap[$k] ?? $d)))->readState($s) === null);

echo "configuration\n";
check('google configured', $o->isConfigured('google') && $o->isConfigured('apple') && $o->isConfigured('twitter'));
check('discord not configured', !$o->isConfigured('discord'));
check('callback url', $o->callbackUrl('demo', 'google') === 'http://app.test/api/demo/auth/oauth/google/callback');

echo "authorize url\n";
[$url, $nonce] = $o->authorizeUrl('demo', 'google');
parse_str(parse_url($url, PHP_URL_QUERY), $q);
check('google endpoint + client', str_starts_with($url, 'https://accounts.google.com/o/oauth2/v2/auth?') && $q['client_id'] === 'g-id');
check('PKCE S256 challenge matches verifier', $q['code_challenge_method'] === 'S256' && $q['code_challenge'] === P::b64url(hash('sha256', $o->pkceVerifier($nonce), true)));
check('state carries provider and slug', ($o->readState($q['state'])['p'] ?? '') === 'google' && ($o->readState($q['state'])['s'] ?? '') === 'demo');
[$au, $an] = $o->authorizeUrl('demo', 'apple'); parse_str(parse_url($au, PHP_URL_QUERY), $aq);
check('apple form_post + nonce, no PKCE', $aq['response_mode'] === 'form_post' && $aq['nonce'] === $an && !isset($aq['code_challenge']));
check('twitter scope has users.read', str_contains((function () use ($o) { parse_str(parse_url($o->authorizeUrl('demo', 'twitter')[0], PHP_URL_QUERY), $x); return $x['scope']; })(), 'users.read'));
check('cookies: apple SameSite=None; Secure, others Lax', str_contains(P::stateCookie('demo', 'n', 'apple'), 'SameSite=None; Secure') && str_contains(P::stateCookie('demo', 'n', 'google'), 'SameSite=Lax'));

echo "token exchange\n";
$route = fn($m, $u, $h, $b) => [200, json_encode(['access_token' => 'at'])];
$o->exchangeCode('demo', 'google', 'the-code', $nonce);
parse_str($last('https://oauth2.googleapis.com/token')['body'], $form);
check('google sends verifier and secret in body', $form['code_verifier'] === $o->pkceVerifier($nonce) && $form['client_secret'] === 'g-secret' && $form['redirect_uri'] === $o->callbackUrl('demo', 'google'));
$o->exchangeCode('demo', 'twitter', 'c', 'n1');
$tw = $last('https://api.x.com/2/oauth2/token');
check('x uses HTTP Basic + PKCE + client_id', $tw['headers']['Authorization'] === 'Basic ' . base64_encode('x-id:x-secret') && str_contains($tw['body'], 'code_verifier=') && str_contains($tw['body'], 'client_id=x-id') && !str_contains($tw['body'], 'client_secret'));
$route = fn($m, $u, $h, $b) => [200, json_encode(['data' => [['access_token' => 'ig', 'user_id' => 9]]])];
check('instagram { data: [...] } variant', ($o->exchangeCode('demo', 'google', 'c', 'n'))['access_token'] === 'ig');
$route = fn($m, $u, $h, $b) => [200, 'access_token=fb&token_type=bearer'];
check('form-encoded token response', ($o->exchangeCode('demo', 'google', 'c', 'n'))['access_token'] === 'fb');
$route = fn($m, $u, $h, $b) => [400, json_encode(['error' => 'invalid_grant'])];
try { $o->exchangeCode('demo', 'google', 'c', 'n'); check('provider error throws', false); } catch (RuntimeException $e) { check('provider error throws', str_contains($e->getMessage(), '400')); }

echo "apple client secret\n";
$jwt = $o->appleClientSecret(); [$h, $b, $sig] = explode('.', $jwt);
$claims = json_decode(P::b64urlDecode($b), true);
check('claims', $claims['iss'] === 'TEAM123456' && $claims['sub'] === 'com.example.services' && $claims['aud'] === 'https://appleid.apple.com' && $claims['exp'] > time());
check('kid header', json_decode(P::b64urlDecode($h), true)['kid'] === 'KEY1234567');
$raw = P::b64urlDecode($sig);
$derInt = function (string $i) { $i = ltrim($i, "\x00"); if (ord($i[0]) & 0x80) $i = "\x00" . $i; return "\x02" . chr(strlen($i)) . $i; };
$der = "\x30" . chr(strlen($derInt(substr($raw, 0, 32)) . $derInt(substr($raw, 32)))) . $derInt(substr($raw, 0, 32)) . $derInt(substr($raw, 32));
check('raw R||S is 64 bytes and the signature verifies', strlen($raw) === 64 && openssl_verify("$h.$b", $der, $pub, OPENSSL_ALGO_SHA256) === 1);

echo "profiles\n";
$route = function ($m, $u, $h, $b) {
    if (str_starts_with($u, 'https://openidconnect.googleapis.com')) return [200, json_encode(['sub' => 'g1', 'email' => 'a@x.com', 'email_verified' => true, 'name' => 'Ada', 'picture' => 'p'])];
    return [404, '{}'];
};
$p = $o->profile('google', ['access_token' => 'at'], ['nonce' => 'n']);
check('google verified email', $p['id'] === 'g1' && $p['email'] === 'a@x.com' && $p['email_verified'] === true);
$route = function ($m, $u, $h, $b) {
    if ($u === 'https://api.github.com/user/emails') return [200, json_encode([['email' => 'c@x.com', 'primary' => true, 'verified' => false]])];
    if ($u === 'https://api.github.com/user') return [200, json_encode(['id' => 4242, 'login' => 'c', 'email' => 'c@x.com'])];
    return [404, '{}'];
};
$p = $o->profile('github', ['access_token' => 'at'], ['nonce' => 'n']);
check('github unverified email stays unverified', $p['id'] === '4242' && $p['email_verified'] === false);
$route = function ($m, $u, $h, $b) {
    if ($u === 'https://api.github.com/user/emails') return [200, json_encode([['email' => 'c@x.com', 'primary' => true, 'verified' => true]])];
    return [200, json_encode(['id' => 4242, 'login' => 'c'])];
};
check('github verified primary email', $o->profile('github', ['access_token' => 'at'], ['nonce' => 'n'])['email_verified'] === true);
$route = function ($m, $u, $h, $b) { return str_contains($u, 'graph.microsoft.com') ? [200, json_encode(['sub' => 'm1', 'email' => 'm@x.com'])] : [404, '{}']; };
check('microsoft email never verified', $o->profile('microsoft', ['access_token' => 'a'], ['nonce' => 'n'])['email_verified'] === false);
$route = function ($m, $u, $h, $b) { return str_contains($u, 'graph.instagram.com') ? [200, json_encode(['user_id' => '99', 'username' => 'iguser'])] : [404, '{}']; };
$p = $o->profile('instagram', ['access_token' => 'a'], ['nonce' => 'n']);
check('instagram has no email, v25.0 graph URL', $p['email'] === null && $p['name'] === 'iguser' && str_contains($last('https://graph.instagram.com')['url'], '/v25.0/me?'));
$route = function ($m, $u, $h, $b) { return str_contains($u, 'discord.com') ? [200, json_encode(['id' => '5', 'username' => 'dd', 'email' => 'd@x.com', 'verified' => true, 'avatar' => 'abc'])] : [404, '{}']; };
$p = $o->profile('discord', ['access_token' => 'a'], ['nonce' => 'n']);
check('discord verified email + avatar url', $p['email_verified'] === true && str_ends_with($p['avatar'], '/5/abc.png'));

$mkId = function (string $nonce, array $over = []) {
    $c = array_merge(['iss' => 'https://appleid.apple.com', 'aud' => 'com.example.services', 'exp' => time() + 600, 'sub' => 'apple-001', 'email' => 't@privaterelay.appleid.com', 'email_verified' => 'true', 'nonce' => $nonce], $over);
    return P::b64url('{"alg":"RS256"}') . '.' . P::b64url(json_encode($c)) . '.sig';
};
$p = $o->profile('apple', ['id_token' => $mkId('N1')], ['nonce' => 'N1', 'apple_user' => json_encode(['name' => ['firstName' => 'Tim', 'lastName' => 'A']])]);
check('apple id_token accepted, name from form field, "true" string verified', $p['name'] === 'Tim A' && $p['email_verified'] === true && $p['id'] === 'apple-001');
foreach ([['nonce wrong', $mkId('other'), 'N1'], ['aud wrong', $mkId('N1', ['aud' => 'x']), 'N1'], ['iss wrong', $mkId('N1', ['iss' => 'https://evil']), 'N1'], ['expired', $mkId('N1', ['exp' => time() - 5]), 'N1']] as [$label, $tok, $n]) {
    try { $o->profile('apple', ['id_token' => $tok], ['nonce' => $n]); check("apple $label refused", false); } catch (RuntimeException) { check("apple $label refused", true); }
}

echo "\n$count checks, $failed failed\n";
exit($failed ? 1 : 0);
