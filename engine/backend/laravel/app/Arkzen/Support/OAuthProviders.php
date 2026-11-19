<?php

// ============================================================
// ARKZEN OAUTH PROVIDERS — social sign-in, framework-free core
//
// Opt-in through the @arkzen:oauth DSL block. Providers: google, github,
// twitter (X), apple, microsoft, facebook, instagram, discord.
// Secrets come from .env only (OAUTH_<PROVIDER>_CLIENT_ID / _CLIENT_SECRET).
//
// This class deliberately imports nothing from Laravel so it can be unit
// tested on its own (tests/oauth_logic_test.php). The generated
// OAuthController injects:
//   $http = fn(string $method, string $url, array $headers, ?string $body): array{0:int,1:string}
//   $env  = fn(string $key, string $default = ''): string
// ============================================================

namespace App\Arkzen\Support;

use RuntimeException;

final class OAuthProviders
{
    public const NAMES = [
        'google' => 'Google', 'github' => 'GitHub', 'twitter' => 'X (Twitter)', 'apple' => 'Apple',
        'microsoft' => 'Microsoft', 'facebook' => 'Facebook', 'instagram' => 'Instagram', 'discord' => 'Discord',
    ];

    public const STATE_TTL = 600;
    private const UA = 'Pluff-OAuth/1.0';

    /** @var callable */ private $http;
    /** @var callable */ private $env;

    public function __construct(callable $http, callable $env)
    {
        $this->http = $http;
        $this->env  = $env;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function env(string $key, string $default = ''): string
    {
        $v = ($this->env)($key, $default);
        return ($v === null || $v === '') ? $default : (string) $v;
    }

    public static function b64url(string $s): string
    {
        return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    }

    public static function b64urlDecode(string $s): string
    {
        return (string) base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4));
    }

    private function key(): string
    {
        $k = $this->env('OAUTH_STATE_SECRET') ?: $this->env('ARKZEN_ENGINE_SECRET');
        if ($k !== '') return $k;
        // No secret configured: derive from APP_KEY when present, else a per-process random key.
        $app = $this->env('APP_KEY');
        if ($app !== '') return 'arkzen-oauth|' . $app;
        static $fallback = null;
        return $fallback ??= random_bytes(32);
    }

    private function hmac(string $data): string
    {
        return self::b64url(hash_hmac('sha256', $data, $this->key(), true));
    }

    public function pkceVerifier(string $nonce): string
    {
        return $this->hmac('pkce:' . $nonce);
    }

    public function signState(array $payload): string
    {
        $body = self::b64url(json_encode($payload, JSON_UNESCAPED_SLASHES));
        return 'v1.' . $body . '.' . $this->hmac('state:' . $body);
    }

    public function readState(?string $token): ?array
    {
        $parts = explode('.', (string) $token);
        if (count($parts) !== 3 || $parts[0] !== 'v1') return null;
        if (!hash_equals($this->hmac('state:' . $parts[1]), $parts[2])) return null;
        $p = json_decode(self::b64urlDecode($parts[1]), true);
        return (is_array($p) && isset($p['e']) && is_int($p['e']) && $p['e'] > time()) ? $p : null;
    }

    public function clientId(string $p): string     { return $this->env('OAUTH_' . strtoupper($p) . '_CLIENT_ID'); }
    public function clientSecret(string $p): string { return $this->env('OAUTH_' . strtoupper($p) . '_CLIENT_SECRET'); }

    public function isConfigured(string $p): bool
    {
        if ($this->clientId($p) === '') return false;
        if ($p === 'apple') {
            return $this->env('OAUTH_APPLE_TEAM_ID') !== '' && $this->env('OAUTH_APPLE_KEY_ID') !== '' && $this->env('OAUTH_APPLE_PRIVATE_KEY') !== '';
        }
        return $this->clientSecret($p) !== '';
    }

    public function redirectBase(): string
    {
        return rtrim($this->env('OAUTH_REDIRECT_BASE') ?: $this->env('APP_URL', 'http://localhost:8000'), '/');
    }

    public function frontendUrl(): string
    {
        return rtrim($this->env('OAUTH_FRONTEND_URL', 'http://localhost:3000'), '/');
    }

    public function callbackUrl(string $slug, string $provider): string
    {
        return $this->redirectBase() . "/api/{$slug}/auth/oauth/{$provider}/callback";
    }

    private function graphVersion(string $p): string
    {
        return $this->env('OAUTH_' . $p . '_API_VERSION', 'v25.0');
    }

    /** Apple's client secret is a short-lived ES256 JWT signed with the team's .p8 key. */
    public function appleClientSecret(): string
    {
        $team = $this->env('OAUTH_APPLE_TEAM_ID');
        $kid  = $this->env('OAUTH_APPLE_KEY_ID');
        $pem  = str_replace('\n', "\n", $this->env('OAUTH_APPLE_PRIVATE_KEY'));
        if ($team === '' || $kid === '' || $pem === '') {
            throw new RuntimeException('Apple needs OAUTH_APPLE_TEAM_ID, OAUTH_APPLE_KEY_ID and OAUTH_APPLE_PRIVATE_KEY');
        }
        $now  = time();
        $head = self::b64url(json_encode(['alg' => 'ES256', 'kid' => $kid, 'typ' => 'JWT']));
        $body = self::b64url(json_encode(['iss' => $team, 'iat' => $now, 'exp' => $now + 300, 'aud' => 'https://appleid.apple.com', 'sub' => $this->clientId('apple')]));
        $key  = openssl_pkey_get_private($pem);
        if ($key === false || !openssl_sign("$head.$body", $der, $key, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('Could not sign the Apple client secret (check OAUTH_APPLE_PRIVATE_KEY)');
        }
        return "$head.$body." . self::b64url(self::derToRaw($der, 32));
    }

    /** OpenSSL returns an ASN.1 DER ECDSA signature; JWT wants the raw R||S pair. */
    public static function derToRaw(string $der, int $size): string
    {
        $o = 2;                                                     // 0x30 len
        if ((ord($der[1]) & 0x80) !== 0) $o += ord($der[1]) & 0x7f;
        $parts = [];
        for ($i = 0; $i < 2; $i++) {
            $len = ord($der[$o + 1]);
            $int = substr($der, $o + 2, $len);
            $o  += 2 + $len;
            $parts[] = str_pad(ltrim($int, "\x00"), $size, "\x00", STR_PAD_LEFT);
        }
        return $parts[0] . $parts[1];
    }

    // ── provider table ───────────────────────────────────────────────────────

    /** @return array<string,mixed> */
    public function def(string $p): array
    {
        $tenant = $this->env('OAUTH_MICROSOFT_TENANT', 'common');
        $fb = $this->graphVersion('FACEBOOK');
        return match ($p) {
            'google' => ['authorize' => 'https://accounts.google.com/o/oauth2/v2/auth', 'token' => 'https://oauth2.googleapis.com/token',
                'scope' => 'openid email profile', 'pkce' => true, 'auth' => 'body', 'extra' => ['access_type' => 'online', 'prompt' => 'select_account']],
            'github' => ['authorize' => 'https://github.com/login/oauth/authorize', 'token' => 'https://github.com/login/oauth/access_token',
                'scope' => 'read:user user:email', 'pkce' => false, 'auth' => 'body', 'extra' => []],
            // X: authorization code + PKCE is mandatory; confidential clients authenticate with HTTP Basic.
            'twitter' => ['authorize' => 'https://x.com/i/oauth2/authorize', 'token' => 'https://api.x.com/2/oauth2/token',
                'scope' => 'users.read tweet.read users.email', 'pkce' => true, 'auth' => 'basic', 'extra' => []],
            // Apple: client_secret is a signed JWT, the callback is a form_post, the identity is in the id_token.
            'apple' => ['authorize' => 'https://appleid.apple.com/auth/authorize', 'token' => 'https://appleid.apple.com/auth/token',
                'scope' => 'name email', 'pkce' => false, 'auth' => 'body', 'extra' => ['response_mode' => 'form_post']],
            'microsoft' => ['authorize' => "https://login.microsoftonline.com/{$tenant}/oauth2/v2.0/authorize", 'token' => "https://login.microsoftonline.com/{$tenant}/oauth2/v2.0/token",
                'scope' => 'openid profile email User.Read', 'pkce' => true, 'auth' => 'body', 'extra' => ['response_mode' => 'query', 'prompt' => 'select_account']],
            'facebook' => ['authorize' => "https://www.facebook.com/{$fb}/dialog/oauth", 'token' => "https://graph.facebook.com/{$fb}/oauth/access_token",
                'scope' => 'email,public_profile', 'pkce' => false, 'auth' => 'body', 'extra' => []],
            // Instagram API with Instagram Login (Basic Display API is gone). Professional accounts only; no email is shared.
            'instagram' => ['authorize' => 'https://www.instagram.com/oauth/authorize', 'token' => 'https://api.instagram.com/oauth/access_token',
                'scope' => 'instagram_business_basic', 'pkce' => false, 'auth' => 'body', 'extra' => []],
            'discord' => ['authorize' => 'https://discord.com/oauth2/authorize', 'token' => 'https://discord.com/api/oauth2/token',
                'scope' => 'identify email', 'pkce' => true, 'auth' => 'body', 'extra' => ['prompt' => 'consent']],
            default => throw new RuntimeException("Unknown OAuth provider: {$p}"),
        };
    }

    // ── flow ─────────────────────────────────────────────────────────────────

    /** @return array{0:string,1:string} [authorizeUrl, nonce] */
    public function authorizeUrl(string $slug, string $provider): array
    {
        $d     = $this->def($provider);
        $nonce = self::b64url(random_bytes(24));
        $state = $this->signState(['n' => $nonce, 'p' => $provider, 's' => $slug, 'e' => time() + self::STATE_TTL]);
        $q = array_merge([
            'client_id' => $this->clientId($provider), 'redirect_uri' => $this->callbackUrl($slug, $provider),
            'response_type' => 'code', 'scope' => $d['scope'], 'state' => $state,
        ], $d['extra']);
        if ($d['pkce']) {
            $q['code_challenge'] = self::b64url(hash('sha256', $this->pkceVerifier($nonce), true));
            $q['code_challenge_method'] = 'S256';
        }
        if ($provider === 'apple') $q['nonce'] = $nonce;
        return [$d['authorize'] . '?' . http_build_query($q, '', '&', PHP_QUERY_RFC3986), $nonce];
    }

    /** @return array<string,mixed> */
    public function exchangeCode(string $slug, string $provider, string $code, string $nonce): array
    {
        $d    = $this->def($provider);
        $form = ['grant_type' => 'authorization_code', 'code' => $code, 'redirect_uri' => $this->callbackUrl($slug, $provider)];
        $headers = ['Content-Type' => 'application/x-www-form-urlencoded', 'Accept' => 'application/json', 'User-Agent' => self::UA];
        $secret  = $provider === 'apple' ? $this->appleClientSecret() : $this->clientSecret($provider);
        if ($d['auth'] === 'basic') {
            $headers['Authorization'] = 'Basic ' . base64_encode($this->clientId($provider) . ':' . $secret);
        } else {
            $form['client_id'] = $this->clientId($provider);
            $form['client_secret'] = $secret;
        }
        if ($d['pkce']) {
            $form['code_verifier'] = $this->pkceVerifier($nonce);
            if ($d['auth'] === 'basic') $form['client_id'] = $this->clientId($provider);
        }
        [$status, $text] = ($this->http)('POST', $d['token'], $headers, http_build_query($form, '', '&', PHP_QUERY_RFC3986));
        $data = json_decode($text, true);
        if (!is_array($data)) { parse_str($text, $data); }                         // some providers answer form-encoded
        if (isset($data['data'][0]) && is_array($data['data'][0])) $data = $data['data'][0];   // Instagram variant
        if ($status < 200 || $status >= 300 || empty($data) || (empty($data['access_token']) && empty($data['id_token']))) {
            throw new RuntimeException("Token exchange failed ({$status})");
        }
        return $data;
    }

    /** @return mixed */
    private function getJson(string $url, array $headers = [])
    {
        [$status, $text] = ($this->http)('GET', $url, array_merge(['Accept' => 'application/json', 'User-Agent' => self::UA], $headers), null);
        $data = json_decode($text, true);
        if ($status < 200 || $status >= 300 || $data === null) {
            throw new RuntimeException("Provider request failed ({$status}) at " . parse_url($url, PHP_URL_HOST));
        }
        return $data;
    }

    private static function truthy($v): bool { return $v === true || $v === 'true'; }

    /**
     * @param array<string,mixed> $t   token response
     * @param array{nonce:string, apple_user?:?string} $ctx
     * @return array{id:string,email:?string,email_verified:bool,name:?string,avatar:?string}
     */
    public function profile(string $provider, array $t, array $ctx): array
    {
        $bearer = ['Authorization' => 'Bearer ' . ($t['access_token'] ?? '')];
        $out = fn($id, $email, $verified, $name, $avatar) => ['id' => (string) $id, 'email' => $email, 'email_verified' => (bool) $verified, 'name' => $name, 'avatar' => $avatar];

        switch ($provider) {
            case 'google':
                $u = $this->getJson('https://openidconnect.googleapis.com/v1/userinfo', $bearer);
                return $out($u['sub'], $u['email'] ?? null, self::truthy($u['email_verified'] ?? false), $u['name'] ?? null, $u['picture'] ?? null);

            case 'github':
                $h = $bearer + ['Accept' => 'application/vnd.github+json', 'X-GitHub-Api-Version' => '2022-11-28'];
                $u = $this->getJson('https://api.github.com/user', $h);
                $email = $u['email'] ?? null; $verified = false;
                try {
                    $list = $this->getJson('https://api.github.com/user/emails', $h);
                    $pick = null;
                    foreach ((array) $list as $e) { if (!empty($e['primary']) && !empty($e['verified'])) { $pick = $e; break; } }
                    if (!$pick) foreach ((array) $list as $e) { if (!empty($e['verified'])) { $pick = $e; break; } }
                    if ($pick) { $email = $pick['email']; $verified = true; }
                } catch (RuntimeException) { /* user:email scope missing or denied: keep the public email, unverified */ }
                return $out($u['id'], $email, $verified, $u['name'] ?? $u['login'] ?? null, $u['avatar_url'] ?? null);

            case 'twitter':
                $r = $this->getJson('https://api.x.com/2/users/me?user.fields=profile_image_url,confirmed_email', $bearer);
                $u = $r['data'] ?? [];
                // X returns an email only when the app has the permission; it is never treated as verified.
                return $out($u['id'] ?? '', $u['confirmed_email'] ?? null, false, $u['name'] ?? $u['username'] ?? null, $u['profile_image_url'] ?? null);

            case 'apple':
                $parts = explode('.', (string) ($t['id_token'] ?? ''));
                if (count($parts) < 2) throw new RuntimeException('Malformed id_token');
                // Signature is not re-verified: the token came straight from Apple's token endpoint over TLS (OIDC Core 3.1.3.7).
                $c = json_decode(self::b64urlDecode($parts[1]), true) ?: [];
                if (($c['iss'] ?? null) !== 'https://appleid.apple.com') throw new RuntimeException('Apple id_token has the wrong issuer');
                if (($c['aud'] ?? null) !== $this->clientId('apple')) throw new RuntimeException('Apple id_token was issued for another client');
                if (empty($c['exp']) || $c['exp'] < time()) throw new RuntimeException('Apple id_token has expired');
                if (($c['nonce'] ?? null) !== $ctx['nonce']) throw new RuntimeException('Apple id_token nonce mismatch');
                $name = null;
                if (!empty($ctx['apple_user'])) {   // Apple sends the name once, on first authorization, as a JSON form field.
                    $au = json_decode($ctx['apple_user'], true);
                    $n = trim(($au['name']['firstName'] ?? '') . ' ' . ($au['name']['lastName'] ?? ''));
                    $name = $n !== '' ? $n : null;
                }
                return $out($c['sub'], $c['email'] ?? null, self::truthy($c['email_verified'] ?? false), $name, null);

            case 'microsoft':
                $u = $this->getJson('https://graph.microsoft.com/oidc/userinfo', $bearer);
                // Microsoft emails are not proven to belong to the user ("nOAuth"), so they are never auto-linked.
                return $out($u['sub'], $u['email'] ?? null, false, $u['name'] ?? null, null);

            case 'facebook':
                $v = $this->graphVersion('FACEBOOK');
                $u = $this->getJson("https://graph.facebook.com/{$v}/me?fields=id,name,email,picture.type(large)&access_token=" . rawurlencode($t['access_token']));
                return $out($u['id'], $u['email'] ?? null, false, $u['name'] ?? null, $u['picture']['data']['url'] ?? null);

            case 'instagram':
                $v = $this->graphVersion('INSTAGRAM');
                $u = $this->getJson("https://graph.instagram.com/{$v}/me?fields=user_id,username,name,profile_picture_url&access_token=" . rawurlencode($t['access_token']));
                return $out($u['user_id'] ?? $u['id'], null, false, $u['name'] ?? $u['username'] ?? null, $u['profile_picture_url'] ?? null);

            case 'discord':
                $u = $this->getJson('https://discord.com/api/users/@me', $bearer);
                $avatar = !empty($u['avatar']) ? "https://cdn.discordapp.com/avatars/{$u['id']}/{$u['avatar']}.png" : null;
                return $out($u['id'], $u['email'] ?? null, ($u['verified'] ?? false) === true, $u['global_name'] ?? $u['username'] ?? null, $avatar);
        }
        throw new RuntimeException("Unknown OAuth provider: {$provider}");
    }

    // ── cookies ──────────────────────────────────────────────────────────────

    public static function stateCookieName(string $slug): string { return "arkzen-oauth-{$slug}"; }

    public static function stateCookie(string $slug, string $nonce, string $provider): string
    {
        // Apple answers with a cross-site POST, which only carries a SameSite=None cookie (and that requires Secure).
        $same = $provider === 'apple' ? 'None; Secure' : 'Lax';
        return self::stateCookieName($slug) . "={$nonce}; Path=/; HttpOnly; Max-Age=" . self::STATE_TTL . "; SameSite={$same}";
    }

    public static function clearStateCookie(string $slug, string $provider): string
    {
        $same = $provider === 'apple' ? 'None; Secure' : 'Lax';
        return self::stateCookieName($slug) . "=; Path=/; HttpOnly; Max-Age=0; SameSite={$same}";
    }
}
