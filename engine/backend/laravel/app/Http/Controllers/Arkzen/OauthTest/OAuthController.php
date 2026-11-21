<?php

// ============================================================
// ARKZEN GENERATED OAUTH CONTROLLER — oauth-test
// Social sign-in layered on the isolated auth. DO NOT EDIT DIRECTLY.
// ============================================================

namespace App\Http\Controllers\Arkzen\OauthTest;

use App\Arkzen\Support\OAuthProviders;
use App\Models\Arkzen\OauthTest\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class OAuthController extends Controller
{
    private const SLUG           = 'oauth-test';
    private const CONN           = 'oauth_test';
    private const PREFIX         = 'oauth_test';
    private const PROVIDERS      = array (
  0 => 'google',
  1 => 'github',
  2 => 'twitter',
  3 => 'apple',
  4 => 'microsoft',
  5 => 'facebook',
  6 => 'instagram',
  7 => 'discord',
);
    private const REDIRECT       = '/oauth-test/dashboard';
    private const ERROR_REDIRECT = '/oauth-test/login';
    private const LINK_VERIFIED  = true;

    private function oauth(): OAuthProviders
    {
        $http = function (string $method, string $url, array $headers, ?string $body): array {
            $req = Http::withHeaders($headers)->timeout(15);
            $res = $method === 'POST'
                ? $req->withBody((string) $body, $headers['Content-Type'] ?? 'application/x-www-form-urlencoded')->post($url)
                : $req->get($url);
            return [$res->status(), $res->body()];
        };
        return new OAuthProviders($http, fn (string $k, string $d = '') => (string) config('arkzen_oauth.' . $k, $d));
    }

    private function go(string $url, ?string $cookie = null): Response
    {
        $r = redirect()->away($url)->header('Cache-Control', 'no-store');
        return $cookie ? $r->header('Set-Cookie', $cookie) : $r;
    }

    private function fail(OAuthProviders $o, string $provider, string $message): Response
    {
        return $this->go(
            $o->frontendUrl() . self::ERROR_REDIRECT . '#' . http_build_query(['arkzen_oauth_error' => $message]),
            OAuthProviders::clearStateCookie(self::SLUG, $provider)
        );
    }

    public function providers(): JsonResponse
    {
        $o = $this->oauth();
        return response()->json(['providers' => array_map(fn ($id) => [
            'id' => $id, 'name' => OAuthProviders::NAMES[$id], 'enabled' => $o->isConfigured($id),
        ], self::PROVIDERS)]);
    }

    public function redirect(string $provider): Response
    {
        if (!in_array($provider, self::PROVIDERS, true)) {
            return response()->json(['message' => 'Unknown OAuth provider.'], 404);
        }
        $o = $this->oauth();
        if (!$o->isConfigured($provider)) {
            return $this->fail($o, $provider, OAuthProviders::NAMES[$provider] . ' sign-in is not configured on this server.');
        }
        [$url, $nonce] = $o->authorizeUrl(self::SLUG, $provider);
        return $this->go($url, OAuthProviders::stateCookie(self::SLUG, $nonce, $provider));
    }

    public function callback(Request $request, string $provider): Response
    {
        if (!in_array($provider, self::PROVIDERS, true)) {
            return response()->json(['message' => 'Unknown OAuth provider.'], 404);
        }
        $o = $this->oauth();
        try {
            if ($request->input('error')) {
                return $this->fail($o, $provider, OAuthProviders::NAMES[$provider] . ' sign-in was cancelled or denied.');
            }
            $st = $o->readState((string) $request->input('state', ''));
            $cookieNonce = $request->cookies->get(OAuthProviders::stateCookieName(self::SLUG));
            if (!$st || ($st['p'] ?? '') !== $provider || ($st['s'] ?? '') !== self::SLUG
                || !is_string($cookieNonce) || $cookieNonce === '' || !hash_equals($cookieNonce, (string) ($st['n'] ?? ''))) {
                return $this->fail($o, $provider, 'Sign-in session expired or was tampered with. Please try again.');
            }
            $code = $request->input('code');
            if (!is_string($code) || $code === '') {
                return $this->fail($o, $provider, 'The provider did not return an authorization code.');
            }

            $tokens  = $o->exchangeCode(self::SLUG, $provider, $code, $st['n']);
            $appleUser = $request->input('user');
            $profile = $o->profile($provider, $tokens, ['nonce' => $st['n'], 'apple_user' => is_string($appleUser) ? $appleUser : null]);
            if ($profile['id'] === '') throw new \RuntimeException('Provider returned no user id');

            $user  = $this->resolveUser($provider, $profile);
            $token = $user->createToken('arkzen-token')->plainTextToken;
            return $this->go(
                $o->frontendUrl() . self::REDIRECT . '#' . http_build_query(['arkzen_oauth_token' => $token, 'arkzen_oauth_slug' => self::SLUG]),
                OAuthProviders::clearStateCookie(self::SLUG, $provider)
            );
        } catch (\Throwable $e) {
            Log::error("[oauth:{$provider}] " . $e->getMessage());
            return $this->fail($o, $provider, 'Sign-in failed. Please try again.');
        }
    }

    /** Finds, links or creates the local user for a provider profile. */
    private function resolveUser(string $provider, array $p): User
    {
        $db       = DB::connection(self::CONN);
        $accounts = self::PREFIX . '_oauth_accounts';
        $now      = now();

        return $db->transaction(function () use ($db, $accounts, $provider, $p, $now) {
            $linked = $db->table($accounts)->where('provider', $provider)->where('provider_user_id', $p['id'])->first();
            if ($linked) {
                $user = User::query()->find($linked->user_id);
                if ($user) {
                    $db->table($accounts)->where('id', $linked->id)->update(['email' => $p['email'], 'avatar' => $p['avatar'], 'updated_at' => $now]);
                    return $user;
                }
                $db->table($accounts)->where('id', $linked->id)->delete();   // orphaned link: re-create below
            }

            $email = $p['email'] ? strtolower($p['email']) : null;
            $user  = null;

            if ($email && $p['email_verified'] && self::LINK_VERIFIED) {
                $user = User::query()->whereRaw('lower(email) = ?', [$email])->first();
                if ($user) {
                    // Pre-hijack defence: this account may have been registered by someone else with this email before
                    // its owner ever signed in with the provider (the users table has no verified-email flag). Revoke
                    // every session and replace the password so only the provider-verified owner can continue.
                    $user->tokens()->delete();
                    $user->forceFill(['password' => Str::random(64)])->save();
                }
            }

            if (!$user) {
                // Providers without a usable email (Instagram, X without permission) get a reserved, non-routable address.
                $own = $email;
                if ($own && User::query()->whereRaw('lower(email) = ?', [$own])->exists()) $own = null;   // taken and not linkable
                $own  = $own ?: strtolower("{$provider}-{$p['id']}@oauth.invalid");
                $name = Str::limit($p['name'] ?: explode('@', $own)[0], 255, '');
                $user = new User();
                $user->forceFill([
                    'name' => $name, 'email' => $own, 'password' => Str::random(64), 'role' => 'user',
                    'email_verified_at' => $p['email_verified'] ? $now : null,
                ])->save();
            }

            $db->table($accounts)->insert([
                'user_id' => $user->id, 'provider' => $provider, 'provider_user_id' => $p['id'],
                'email' => $p['email'], 'avatar' => $p['avatar'], 'created_at' => $now, 'updated_at' => $now,
            ]);
            return $user;
        });
    }
}